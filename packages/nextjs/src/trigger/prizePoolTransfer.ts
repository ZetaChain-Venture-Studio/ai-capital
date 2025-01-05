import { logger, task } from "@trigger.dev/sdk/v3";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { Account, privateKeyToAccount } from "thirdweb/wallets";
import { deWhitelist } from "../../app/api/chat/route";
import { client, prizePoolSmartContract } from "~~/utils/types/sdks";

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

    const userAddress: string = payload.userAddress;
    const sellTargetTokenAddress: string = payload.sellTargetTokenAddress;
    const buyTargetTokenAddress: string = payload.buyTargetTokenAddress;
    const percentToSell: number = payload.percentToSell;

    //await wait.for({ seconds: 5 });
    await swapTokens(userAddress, sellTargetTokenAddress, buyTargetTokenAddress, percentToSell);
    await transferPrizePool(userAddress);
    await deWhitelist(userAddress);

    return {
      message: "Hello, world!",
    }
  },
});

const account: Account = privateKeyToAccount({
  client,
  privateKey: process.env.BACKEND_WALLET_PRIVATE_KEY || "",
});


async function swapTokens(
  userAddress: string,
  sellTargetTokenAddress: string,
  buyTargetTokenAddress: string,
  percentToSell: number,
) {
  const percentToSellBigInt = BigInt(percentToSell);
  const transaction = prepareContractCall({
    contract: prizePoolSmartContract,
    method: "function _swapTokens(address _user, address tokenA, address tokenB, uint256 percent)",
    params: [userAddress, sellTargetTokenAddress, buyTargetTokenAddress, percentToSellBigInt],
  });

  const transactionReceipt = await sendAndConfirmTransaction({
    transaction,
    account,
  });

  console.log("Tx Receipt - swapTokens: ", transactionReceipt);
}

async function transferPrizePool(walletAddresses: string) {
  const transaction = prepareContractCall({
    contract: prizePoolSmartContract,
    method: "function transfer(address _receiver)",
    params: [walletAddresses],
  });

  const transactionReceipt = await sendAndConfirmTransaction({
    transaction,
    account,
  });

  console.log("Tx Receipt - transfer: ", transactionReceipt);
}
