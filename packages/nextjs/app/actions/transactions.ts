"use server";

import { estimateContractGas } from "viem/actions";
import { aic2Contract, walletClient } from "~~/lib/blockchain/clients";
import { CHAIN_ID } from "~~/lib/data";

let SWAP_ROUTER = "";

if (CHAIN_ID == 10) {
  SWAP_ROUTER = "0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2";
}

export async function hasPaid(user: `0x${string}`): Promise<boolean> {
  const paid = await aic2Contract.read.whitelist([user]);
  return paid > 0;
}

export async function decrementPaymentCounter(user: `0x${string}`) {
  const result = await aic2Contract.write.decWhitelist([user]);

  console.log("result", result);
}

export async function executeSwap(from: `0x${string}`, to: `0x${string}`, percentage: number) {
  const approveGas = await estimateContractGas(walletClient, {
    abi: aic2Contract.abi,
    functionName: "approveToken",
    address: aic2Contract.address,
    args: [from, SWAP_ROUTER, BigInt(1000000)],
  });

  const approveResult = await aic2Contract.write.approveToken([from, SWAP_ROUTER, BigInt(1000000)], {
    gas: approveGas,
  });
  console.log("approveResult", approveResult);

  const swapGas = await estimateContractGas(walletClient, {
    abi: aic2Contract.abi,
    functionName: "_swapTokens",
    address: aic2Contract.address,
    args: [walletClient.account.address, from, to, BigInt(percentage)],
  });

  console.log("GAS: >>>>>>>>>>>>>>>>>", swapGas);

  const result = await aic2Contract.write._swapTokens([walletClient.account.address, from, to, BigInt(percentage)], {
    gas: swapGas,
  });
  console.log("result", result);

  return result;
}
