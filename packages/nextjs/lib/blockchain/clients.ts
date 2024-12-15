import { createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { AIC2_ABI } from "~~/lib/abis/AIC2";

const PRIVATE_KEY: `0x${string}` = process.env.PRIVATE_KEY as `0x${string}`;

const account = privateKeyToAccount(PRIVATE_KEY);

export const walletClient = createWalletClient({
  transport: http(),
  chain: hardhat,
  account: account,
});

export const aic2Contract = getContract({
  address: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  abi: AIC2_ABI,
  client: walletClient,
});
