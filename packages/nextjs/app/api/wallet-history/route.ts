import { NextResponse } from "next/server";
import Moralis from "moralis";

// The chain and walletAddress could be passed as query params instead,
// but for simplicity we'll hard-code them here
const chain = "0xA"; // Optimism chain
const walletAddress = "0x2Ca3355E6e09e54bE4A70F44d6709DABA08fC786";

export async function GET() {
  try {
    // Load the private API key from env (not exposed to the client)
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      return new NextResponse("MORALIS_API_KEY not set", { status: 500 });
    }

    // Initialize Moralis on the server side
    await Moralis.start({ apiKey });

    // Fetch the wallet history
    const response = await Moralis.EvmApi.wallets.getWalletHistory({
      chain,
      order: "DESC",
      address: walletAddress,
    });

    const data = response.result; // array of transactions
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching wallet history:", error);
    return new NextResponse("Error fetching wallet history", { status: 500 });
  }
}
