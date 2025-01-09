import { client, prizePoolSmartContract } from "./../../utils/types/sdks";
import { logger, task } from "@trigger.dev/sdk/v3";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { Account, privateKeyToAccount } from "thirdweb/wallets";

export const transferPrize = task({
  id: "transfer-prize-pool",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  retry: {
    maxAttempts: 1,
  },
  queue: {
    concurrencyLimit: 1,
  },
  run: async (payload: any, { ctx }) => {
    logger.log("Hello, world!", { payload, ctx });

    logger.log("Payload!", { payload });

    const userAddress: string = payload.userAddress;
    const swapATargetTokenAddress: string = payload.sellTargetTokenAddress;
    const swapBTargetTokenAddress: string = payload.buyTargetTokenAddress;

    //await wait.for({ seconds: 5 });
    await swapTokens(userAddress, swapATargetTokenAddress, swapBTargetTokenAddress);

    return {
      message: "Hello, world!",
    };
  },
});

const account: Account = privateKeyToAccount({
  client,
  privateKey: process.env.BACKEND_WALLET_PRIVATE_KEY || "",
});

async function swapTokens(userAddress: string, swapATargetTokenAddress: string, swapBTargetTokenAddress: string) {
  console.log();
  const transaction = prepareContractCall({
    contract: prizePoolSmartContract,
    method: "function swapTokens(address _user, address tokenA, address tokenB)",
    params: [userAddress, swapATargetTokenAddress, swapBTargetTokenAddress],
  });

  const transactionReceipt = await sendAndConfirmTransaction({
    transaction,
    account,
  });

  console.log("Tx Receipt - swapTokens: ", transactionReceipt);
}
