import { createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimism } from "viem/chains";
import { AIC2_ABI } from "~~/lib/abis/AIC2";

const PRIVATE_KEY: `0x${string}` = process.env.PRIVATE_KEY as `0x${string}`;

const account = privateKeyToAccount(PRIVATE_KEY);

export const walletClient = createWalletClient({
  transport: http(),
  chain: optimism,
  account: account,
});

export const aic2Contract = getContract({
  address: "0xb13b7A60C88e1Ba2a204423aB420C60ACBA62c53",
  abi: AIC2_ABI,
  client: walletClient,
});
