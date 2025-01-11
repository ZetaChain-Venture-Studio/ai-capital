import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { parseAbi } from "viem";

interface Token {
  symbol: string;
  decimals: number;
  balance: bigint | string;
  price?: number;
  balanceFormatted?: number;
  valueUSD?: number;
}

export const dynamic = "force-dynamic";

const aicABI = parseAbi(["function getBalances(address[] memory tokens) public view returns (uint256[] memory)"]);

export async function GET() {
  const rpcUrl = process.env.ZETA_CHAIN_RPC;
  const cmcApiKey = process.env.CMC_API_KEY;
  const aicAddress = process.env.NEXT_PUBLIC_AIC_ADDRESS;
  const listOfAddressesString = process.env.LIST_OF_ADDRESSES;

  if (!rpcUrl || !cmcApiKey || !aicAddress || !listOfAddressesString) {
    console.error("environment variable not set");
    return NextResponse.json({ error: "environment variable not set" }, { status: 500 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const listOfAddresses = JSON.parse(listOfAddressesString);

    const aicContract = new ethers.Contract(aicAddress, aicABI, provider);
    const balances = await aicContract.getBalances([...listOfAddresses]);
    const zetaBalance = await provider.getBalance(aicAddress);

    const tokens: Token[] = [
      { symbol: "USDC", decimals: 6, balance: balances[0] },
      { symbol: "BTC", decimals: 8, balance: balances[1] },
      { symbol: "ETH", decimals: 18, balance: balances[2] },
      { symbol: "BNB", decimals: 18, balance: balances[3] },
      { symbol: "ULTI", decimals: 18, balance: balances[4] },
      { symbol: "PEPE", decimals: 18, balance: balances[5] },
      { symbol: "SHIB", decimals: 18, balance: balances[6] },
      { symbol: "DAI", decimals: 18, balance: balances[7] },
      { symbol: "POL", decimals: 18, balance: balances[8] },
      { symbol: "SOL", decimals: 9, balance: balances[9] },
      { symbol: "ZETA", decimals: 18, balance: zetaBalance },
    ];

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
      const balanceFormatted = Number(ethers.formatUnits(token.balance, token.decimals));
      const valueUSD = balanceFormatted * price;

      token.price = price;
      token.balanceFormatted = balanceFormatted;
      token.valueUSD = valueUSD;
      token.balance = token.balance.toString();

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
