"use server";

import { randomBytes } from "crypto";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { createWalletClient, http, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { z } from "zod";
import { OPENAI_PROMPT } from "~~/lib/prompts/openai";

const apiKey = process.env.OPENAI_API_KEY;
const PRIVATE_KEY: `0x${string}` = process.env.PRIVATE_KEY as `0x${string}`;

const PitchAssessment = z.object({
  assessment: z.enum(["positive", "negative"]),
});

const account = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  transport: http(),
  chain: hardhat,
  account: account,
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function analyzePitch(pitch: string, _tokenAddress: string, _sender: string) {
  console.log("ADDRESSES:", await walletClient.getAddresses());

  // Check if user has any attempt left (aka the user has paid)
  // TODO: CALL CONTRACT

  // Check if pitch is valid
  console.log("Pitch:", pitch);

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  let success = false;
  if (pitch.length < 50) {
    return {
      success: false,
      message: "Please ensure your pitch is at least 50 characters.",
    };
  }

  const investorResponse = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: OPENAI_PROMPT },
      { role: "user", content: `Please give me a pitch assessment based on the following pitch: ${pitch}` },
    ],
    response_format: zodResponseFormat(PitchAssessment, "example"),
  });

  console.log("THE INVESTOR SAID: ", investorResponse.choices[0].message.content);

  if (investorResponse.choices[0].message.content === "negative") {
    success = false;
  } else if (investorResponse.choices[0].message.content === "positive") {
    // execute investment
    // TODO
  }

  // Response to the user
  const initialContext = {
    role: "system",
    content: OPENAI_PROMPT,
  };

  const messages = [initialContext, { role: "user", content: pitch }];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  });
  console.log("messages", response.choices[0].message.content);

  // Actual execution...

  return {
    aiResponseText: JSON.parse(response.choices[0].message.content as string).aiResponseText,
    success: success,
  };

  // generate random address
  // const randomAddress = privateKeyToAddress(toHex(randomBytes(32)));

  // const ta = "0x734408719d916D72E78aCf45ff7E227D53E66eEa";

  // const s = "0x734408719d916D72E78aCf45ff7E227D53E66eEa";

  // // Call swap contract
  // const contract = getContract({
  //   abi: SWAP_ROUTER_ABI,
  //   address: randomAddress,
  //   client: walletClient,
  // });

  // const encodedData = encodeFunctionData({
  //   abi: SWAP_ROUTER_ABI,
  //   functionName: "swapExactTokensForTokens",
  //   args: [BigInt(1), BigInt(1), [ta, randomAddress], randomAddress],
  // });

  // const modifiedData = s + encodedData.slice(2);

  // const request = await walletClient.prepareTransactionRequest({
  //   to: randomAddress,
  //   abi: SWAP_ROUTER_ABI,
  //   data: modifiedData as `0x${string}`,
  //   account: s,
  // });
}
