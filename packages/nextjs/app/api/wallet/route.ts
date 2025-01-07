import { NextResponse } from "next/server";

interface Token {
  token_address: string;
  symbol: string;
  name: string;
  balance_formatted: string;
  usd_value: number;
  chain?: string;
}

interface PortfolioResponse {
  result: Token[];
}

const CHAIN_IDS = [
  "base",
];

export async function GET() {
  try {
    // Load the private API key from environment variables
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      return new NextResponse("MORALIS_API_KEY not set", { status: 500 });
    }

    // const walletAddress = "0xb13b7A60C88e1Ba2a204423aB420C60ACBA62c53";
    const walletAddress = "0x2Ca3355E6e09e54bE4A70F44d6709DABA08fC786";

    // Fetch tokens from Moralis for each chain
    const promises = CHAIN_IDS.map(async (chain) => {
      const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/tokens?chain=${chain}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-API-Key": apiKey,
        },
      });

      if (!res.ok) {
        console.error(`Failed to fetch tokens for chain ${chain}:`, res.statusText);
        return [];
      }

      const data = (await res.json()) as PortfolioResponse;
      // Attach chain info to each token
      return (data.result || []).map((token) => ({
        ...token,
        chain,
      }));
    });

    const results = await Promise.all(promises);
    const allTokens = results.flat();

    // Filter for USDC token (by symbol or token address)
    const usdcToken = allTokens.find(
      (token) =>
        token.symbol.toUpperCase() === "USDC" &&
        token.usd_value > 0 // Ensure it has a positive USD value
    );

    if (!usdcToken) {
      return NextResponse.json({ amount: 0 }); // Return 0 if no USDC found
    }

    // Send the USDC amount back to the client
    return NextResponse.json({ amount: usdcToken.usd_value });
  } catch (error) {
    console.error("Error fetching Moralis data:", error);
    return new NextResponse("Error fetching data", { status: 500 });
  }
}
