import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { CHAIN_IDS, PortfolioResponse } from "@/utils/types/types";

export const dynamic = "force-dynamic";
/*
Query used to create table:

CREATE TABLE portfolio (
    id SERIAL PRIMARY KEY, -- Auto-incrementing unique ID
    portfolio_status TEXT NOT NULL, -- Portfolio status column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Auto-inserted timestamp
);

You can call this endpoint manually like so:
http://localhost:3000/api/query-portfolio
*/

export async function GET(req: Request) {

  const authHeader = req.headers.get('authorization');

  //We can set an env var in our local machines to directly call this endpoint for local testing
  if(process.env.TEST_ENV && process.env.TEST_ENV==="dev")
  {}
  else if(authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      console.error('MORALIS_API_KEY environment variable not set');
      return NextResponse.json({ error: 'MORALIS_API_KEY environment variable not set' }, { status: 500 });
    }
    
    const walletAddress = "0xb13b7A60C88e1Ba2a204423aB420C60ACBA62c53"; // example address
    
    // Fetch tokens from all chains concurrently
    const promises = CHAIN_IDS.map(async chain => {
      const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/tokens?chain=${chain}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          "X-API-Key": apiKey,
        },
        // For dynamic data, you can use 'no-store':
        // cache: 'no-store'
      });
    
      if (!res.ok) {
        console.error(`Failed to fetch tokens for chain ${chain}:`, res.statusText);
        return [];
      }
    
      const data = (await res.json()) as PortfolioResponse;
      // Add chain property to each token
      return (data.result || []).map(token => ({ ...token, chain }));
    });
    
    // Wait for all fetches
    const results = await Promise.all(promises);
    // Flatten the array of arrays
    const tokens = results.flat();

    const tokensJsonString = JSON.stringify(tokens);
    // console.log(tokensJsonString);

    try {
      //If the data is exactly the same, then it will not create a new entry
      //this is best since we will only store new entries in db when it is different data
        const res = await sql`
            INSERT INTO portfolio (portfolio_status)
            VALUES (${tokensJsonString})
        `;
      //   console.log('Database response:', {
      //     command: res.command,
      //     rowCount: res.rowCount,
      //     rows: res.rows
      // });    
    } catch (error) {
        console.error('Failed to insert portfolio data:', error);
        return NextResponse.json({ error: 'Failed to save portfolio data' }, { status: 500 });
    }


    return NextResponse.json({});
}