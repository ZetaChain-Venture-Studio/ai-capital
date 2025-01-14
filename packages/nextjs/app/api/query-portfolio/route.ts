import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ethers } from "ethers";
import { parseAbi } from "viem";
import { tokens as tokensBase } from "~~/lib/constants";
import { Token } from "~~/types/token";

export const dynamic = "force-dynamic";

const aicABI = parseAbi(["function getBalances(address[] memory tokens) public view returns (uint256[] memory)"]);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  //We can set an env var in our local machines to directly call this endpoint for local testing
  if (process.env.TEST_ENV && process.env.TEST_ENV === "dev") {
  } else if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const rpcUrl = process.env.ZETA_CHAIN_RPC;
  const cmcApiKey = process.env.CMC_API_KEY;
  const aicAddress = process.env.NEXT_PUBLIC_AIC_ADDRESS;
  const tableName = process.env.PORTFOLIO_HISTORY_TABLE;

  if (!rpcUrl || !cmcApiKey || !aicAddress || !tableName) {
    console.error("environment variable not set");
    return NextResponse.json({ error: "environment variable not set" }, { status: 500 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const addresses: string[] = [];
    tokensBase.forEach((token, index) => {
      if (index < tokensBase.length) {
        addresses.push(token.address);
      }
    });
    const aicContract = new ethers.Contract(aicAddress, aicABI, provider);
    const balances = await aicContract.getBalances(addresses);
    // const zetaBalance = await provider.getBalance(aicAddress);

    const tokens: Token[] = tokensBase.map((token, index) => ({
      ...token,
      balance: balances[index] || 0,
    }));

    const symbols = tokens.map(t => t.symbol).join(",");

    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}`,
      {
        method: "GET",
        headers: {
          "X-CMC_PRO_API_KEY": cmcApiKey,
          Accept: "application/json",
        },
      },
    );

    const data = await response.json();
    let totalUsdValue = 0;

    tokens.forEach(token => {
      const price = data.data[token.symbol]?.quote?.USD?.price || 0;
      const balanceFormatted = Number(ethers.formatUnits(token.balance || 0, token.decimals));
      const valueUSD = balanceFormatted * price;

      token.price = price;
      token.balanceFormatted = balanceFormatted;
      token.valueUSD = valueUSD;

      totalUsdValue += valueUSD;
    });

    const now = new Date();
    // const currentDate = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
    const unixTimestamp = Math.floor(now.getTime() / 1000);

    const queryText = `
      INSERT INTO ${tableName} (
        total_value_usd,
        usd_value,
        btc_value,
        eth_value,
        bnb_value,
        ulti_value,
        pepe_value,
        shib_value,
        dai_value,
        pol_value,
        sol_value,
        zeta_value,
        date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
    `;

    const queryValues = [
      totalUsdValue,
      tokens[0].valueUSD, // USDC
      tokens[1].valueUSD, // BTC
      tokens[2].valueUSD, // ETH
      tokens[3].valueUSD, // BNB
      tokens[4].valueUSD, // ULTI
      tokens[5].valueUSD, // PEPE
      tokens[6].valueUSD, // SHIB
      tokens[7].valueUSD, // DAI
      tokens[8].valueUSD, // POL
      tokens[9].valueUSD, // SOL
      tokens[10].valueUSD, // ZETA
      unixTimestamp,
    ];

    await sql.query(queryText, queryValues);
  } catch (error) {
    console.error("Failed to insert portfolio data:", error);
    return NextResponse.json({ error: "Failed to save portfolio data" }, { status: 500 });
  }

  return NextResponse.json({});
}
