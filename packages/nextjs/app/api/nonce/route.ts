import { NextRequest, NextResponse } from "next/server";
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

/*
Call this endpoint like so:
/api/nonce?userAddress="0x123"
*/
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const userAddress = url.searchParams.get("userAddress"); // Add this line

    if (!userAddress) {
    return NextResponse.json({ error: "User Address required" }, { status: 400 });
    }

  try {
    // Queue commands: increment the counter and get its new value
    const p = redis.multi();
    p.incr("myNonceCounter");
    p.get<number>("myNonceCounter");
    
    // execute the transaction
    const res = await p.exec();
    const newValue = res[1]; 
    const nonce = Number(newValue);

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error("Error calling db to calculate airdrop score:", error);
    return NextResponse.json({ error: "Error calling db to calculate airdrop score" }, { status: 500 });
  }
}
