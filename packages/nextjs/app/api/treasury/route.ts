import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { parseAbi } from "viem";
import { tokens as tokensBase } from "~~/lib/constants";
import { Token } from "~~/types/token";

export const dynamic = "force-dynamic";

const aicABI = parseAbi(["function getBalances(address[] memory tokens) public view returns (uint256[] memory)"]);

export async function GET() {
  const rpcUrl = process.env.ZETA_CHAIN_RPC;
  const cmcApiKey = process.env.CMC_API_KEY;
  const aicAddress = process.env.NEXT_PUBLIC_AIC_ADDRESS;

  if (!rpcUrl || !cmcApiKey || !aicAddress) {
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
      balance: balances[index].toString() || 0,
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

    return NextResponse.json({
      totalUsdValue,
      tokens,
    });
  } catch (error) {
    console.error("Failed to insert portfolio data:", error);
    return NextResponse.json({ error: "Failed to save portfolio data" }, { status: 500 });
  }
}
