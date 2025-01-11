import { NextRequest, NextResponse } from "next/server";
import { client, prizePoolSmartContract } from "@/utils/types/sdks";
import { tasks } from "@trigger.dev/sdk/v3";
import { sql } from "@vercel/postgres";
import { OpenAI } from "openai";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { readContract } from "thirdweb";
import { Account, privateKeyToAccount } from "thirdweb/wallets";
import { OPENAI_PROMPT } from "~~/lib/prompts/openai";

export const maxDuration = 300;

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("Missing openai API key.");
}

const openai = new OpenAI({
  apiKey,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userAddress, userMessage, swapATargetTokenAddress, swapBTargetTokenAddress } = body;

  if (!userAddress || !userMessage || !swapATargetTokenAddress || !swapBTargetTokenAddress) {
    return NextResponse.json({ error: "Address, Prompt, swap token a + b required" }, { status: 400 });
  }

  try {
    //Check if a user is whitelisted before handling prompt
    const data = await checkWhitelist(userAddress);
    if (data === 0) {
      return NextResponse.json({ error: "Address not whitelisted" }, { status: 401 });
    }

    if (!/^[A-Za-z0-9\s.,!?;:'"()—\-]*$/.test(userMessage.pitch)) {
      await deWhitelist(userAddress);
      return NextResponse.json({ error: "No special characters allowed" }, { status: 400 });
    }

    const contextMessage = {
      role: "system",
      content: OPENAI_PROMPT,
    };

    const messages = [contextMessage, { role: "user", content: userMessage.pitch }];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    });

    // const parsedMessage = JSON.parse(userMessage);
    const aiResponse = JSON.parse(
      response.choices[0].message.content ?? '{\n    "success": false,\n    "aiResponseText": "No AI response."\n}',
    );

    const result = await sql`
      INSERT INTO messages (
        user_address,
        token,
        trade_type,
        allocation,
        pitch,
        ai_response_text,
        success
      ) VALUES (
        ${userAddress},
        ${userMessage.token},
        ${userMessage.tradeType},
        ${userMessage.allocation},
        ${userMessage.pitch},
        ${aiResponse.aiResponseText},
        ${aiResponse.success}
      );
    `;
    console.log("Insert successful:", result);

    //Succesful prompt - transfer prize pool
    let handle;

    if (aiResponse.success) {
      //To deploy a new version run:
      //npx trigger.dev@latest deploy -e staging
      //npx trigger.dev@latest deploy -e prod
      handle = await tasks.trigger("transfer-prize-pool", {
        userAddress: userAddress,
        sellTargetTokenAddress: swapATargetTokenAddress,
        buyTargetTokenAddress: swapBTargetTokenAddress,
      });
    }
    //Unsuccesful prompt - dewhitelist user
    else {
      await deWhitelist(userAddress);
    }

    return NextResponse.json({
      // "llm-response": response.choices[0].message,
      aiResponse: aiResponse.aiResponseText,
      success: aiResponse.success,
      handle: handle,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

const account: Account = privateKeyToAccount({
  client,
  privateKey: process.env.BACKEND_WALLET_PRIVATE_KEY || "",
});

async function checkWhitelist(walletAddresses: string) {
  const data = await readContract({
    contract: prizePoolSmartContract,
    method: "function whitelist(address user) returns (uint8)",
    params: [walletAddresses],
  });

  console.log("data inside check whitelist: ", data);

  return data;
}

async function deWhitelist(walletAddresses: string) {
  const transaction = prepareContractCall({
    contract: prizePoolSmartContract,
    method: "function deWhitelist(address _user)",
    params: [walletAddresses],
  });

  const transactionReceipt = await sendAndConfirmTransaction({
    transaction,
    account,
  });

  console.log("Tx Receipt - deWhitelist: ", transactionReceipt);
}
