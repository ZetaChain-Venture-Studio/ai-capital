"use server";

import { aic2Contract, walletClient } from "~~/lib/blockchain/clients";

export async function executeInvestment() {
  console.log("TODO: Execute investment");
}

export async function hasPaid(user: `0x${string}`): Promise<boolean> {
  const paid = await aic2Contract.read.whitelist([user]);
  return paid > 0;
}

export async function decrementPaymentCounter(user: `0x${string}`) {
  const result = await aic2Contract.write.decWhitelist([user]);

  console.log("result", result);
}
