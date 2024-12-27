import { NextRequest, NextResponse } from 'next/server';

interface Token {
  token_address: string;
  symbol: string;
  name: string;
  logo: string;
  thumbnail: string;
  decimals: number;
  balance: string;
  possible_spam: boolean;
  verified_contract: boolean;
  balance_formatted: string;
  usd_price: number;
  usd_price_24hr_percent_change: number;
  usd_price_24hr_usd_change: number;
  usd_value: number;
  usd_value_24hr_usd_change: number;
  native_token: boolean;
  portfolio_percentage: number;
  chain?: string;
}

interface PortfolioResponse {
  result: Token[];
}

const CHAIN_IDS = [
  "optimism", // Optimism mainnet
];

export async function GET(request: NextRequest) {
  try {
    // Load the private API key from env (NOT exposed to the client)
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      return new NextResponse("MORALIS_API_KEY not set", { status: 500 });
    }

    const walletAddress = "0xb13b7A60C88e1Ba2a204423aB420C60ACBA62c53";

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

    // Send the combined tokens back to the client
    return NextResponse.json(allTokens);
  } catch (error) {
    console.error("Error fetching Moralis data:", error);
    return new NextResponse("Error fetching data", { status: 500 });
  }
}
