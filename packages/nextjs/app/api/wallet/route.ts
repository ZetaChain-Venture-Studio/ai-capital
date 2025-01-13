import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { parseAbi } from "viem";

export const dynamic = "force-dynamic";
const erc20ABI = parseAbi(["function balanceOf(address account) public view returns (uint256)"]);

export async function GET() {
  try {
    const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
    const bountyAddress = process.env.NEXT_PUBLIC_BOUNTY_ADDRESS;
    const rpcUrl = process.env.ZETA_CHAIN_RPC;

    if (!usdcAddress || !bountyAddress || !rpcUrl) {
      console.error("environment variable not set");
      return NextResponse.json({ error: "environment variable not set" }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const usdcContract = new ethers.Contract(usdcAddress, erc20ABI, provider);
    const balance = await usdcContract.balanceOf(bountyAddress);

    return NextResponse.json({ bounty: balance ? ethers.formatUnits(balance, 6) : 0 });
  } catch (error) {
    console.error("Error fetching Moralis data:", error);
    return new NextResponse("Error fetching data", { status: 500 });
  }
}
