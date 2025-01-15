import { NextRequest, NextResponse } from "next/server";
import { client, prizePoolSmartContract } from "@/utils/types/sdks";
import { tasks } from "@trigger.dev/sdk/v3";
import { sql } from "@vercel/postgres";
import { OpenAI } from "openai";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { readContract } from "thirdweb";
import { Account, privateKeyToAccount } from "thirdweb/wallets";
import { OPENAI_PROMPT } from "~~/lib/prompts/openai";

const apiKey = process.env.OPENAI_API_KEY;
const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;

if (!apiKey) {
  throw new Error("Missing OpenAI API key.");
}
if (!huggingFaceApiKey) {
  console.warn("Missing Hugging Face API key. Prompt injection check may fail.");
}

const openai = new OpenAI({
  apiKey,
});

export const maxDuration = 300;

/**
 * Utility: Fetch with a 15s timeout using AbortController
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Utility: Calls the Hugging Face model, optionally waiting for it
 * by including "x-wait-for-model" header. Enforces up to 15s.
 */
async function callHuggingFaceModel(input: string, waitForModel = false) {
  return fetchWithTimeout(
    "https://api-inference.huggingface.co/models/protectai/deberta-v3-base-prompt-injection-v2",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${huggingFaceApiKey}`,
        "Content-Type": "application/json",
        // Conditionally add "x-wait-for-model": "true"
        ...(waitForModel ? { "x-wait-for-model": "true" } : {}),
      },
      body: JSON.stringify({ inputs: input }),
    },
    15000 // 15-second timeout
  );
}

/**
 * 1) Check for prompt injection using Hugging Face
 *    Return { injectionLabel: 'INJECTION' | 'SAFE' | 'UNKNOWN', injectionScore: number }
 */
async function checkPromptInjection(input: string): Promise<{
  injectionLabel: string;
  injectionScore: number;
}> {
  try {
    // 1) First call WITHOUT x-wait-for-model
    let response = await callHuggingFaceModel(input, false);

    if (response.status === 503) {
      // 2) If 503, we retry ONCE with x-wait-for-model: "true"
      console.warn("Got 503 from HF model, retrying with x-wait-for-model:true");
      response = await callHuggingFaceModel(input, true);

      // If it is STILL 503 after waiting, we drop it and move on
      if (response.status === 503) {
        console.warn("Got 503 again. Dropping prompt injection check and returning UNKNOWN.");
        return { injectionLabel: "UNKNOWN", injectionScore: 0 };
      }
    }

    if (!response.ok) {
      console.error(
        `Hugging Face Model Error: ${response.status} ${response.statusText}`
      );
      return { injectionLabel: "UNKNOWN", injectionScore: 0 };
    }

    const result = await response.json();
    console.log("Hugging Face Response:", result);

    // Expecting: [[ { label: "INJECTION", score: 0.99 }, { label: "SAFE", ... } ]]
    if (Array.isArray(result) && result[0] && Array.isArray(result[0])) {
      const [firstLabelObj] = result[0];
      if (
        firstLabelObj &&
        firstLabelObj.label &&
        typeof firstLabelObj.score === "number"
      ) {
        return {
          injectionLabel: firstLabelObj.label,
          injectionScore: firstLabelObj.score,
        };
      }
    }

    // If the structure is not as expected
    console.error("Unexpected structure in Hugging Face response.");
    return { injectionLabel: "UNKNOWN", injectionScore: 0 };
  } catch (error) {
    console.error("Error checking prompt injection:", error);
    return { injectionLabel: "UNKNOWN", injectionScore: 0 };
  }
}

/**
 * 2) Main POST handler
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userAddress, userMessage, swapATargetTokenAddress, swapBTargetTokenAddress } = body;

  if (!userAddress || !userMessage || !swapATargetTokenAddress || !swapBTargetTokenAddress) {
    return NextResponse.json(
      { error: "Address, Prompt, swap token a + b required" },
      { status: 400 }
    );
  }
  console.log("Received appropriate variables");

  try {
    // 2a) Check if user is whitelisted
    const data = await checkWhitelist(userAddress);
    if (data === 0) {
      return NextResponse.json({ error: "Address not whitelisted" }, { status: 401 });
    }
    console.log("User is whitelisted");

    // 2b) Basic special character check
    if (!/^[A-Za-z0-9\s.,!?;:'"()—\-]*$/.test(userMessage.pitch)) {
      await deWhitelist(userAddress);
      return NextResponse.json(
        { error: "No special characters allowed" },
        { status: 400 }
      );
    }
    console.log("No special characters found");

    // 2c) Check for prompt injection (with 15s max wait for HF)
    const { injectionLabel, injectionScore } = await checkPromptInjection(userMessage.pitch);

    // 2d) Build system prompt - conditionally add mocking text if "INJECTION"
    let extendedSystemPrompt = OPENAI_PROMPT;
    if (injectionLabel === "INJECTION") {
      extendedSystemPrompt += `
# Additional Info #
The Hugging Face prompt-injection model labeled this pitch as "${injectionLabel}"
with a score of ${injectionScore} out of 1. Lucy, feel free to mock user for trying to do a prompt injection.
`;
    }

    // 2e) Prepare messages for GPT
    const contextMessage = {
      role: "system",
      content: extendedSystemPrompt,
    };
    const messages = [contextMessage, { role: "user", content: userMessage.pitch }];

    // 2f) Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.85,
      max_tokens: 256,
      top_p: 1.0,
    });
    console.log("OpenAI response received");

    // 2g) Parse Lucy's response into the required JSON format
    const aiResponse = JSON.parse(
      response.choices[0].message.content ?? '{\n    "success": false,\n    "aiResponseText": "No AI response."\n}'
    );
    console.log("OpenAI response parsed");

    // 2h) Insert into DB
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

    // 2i) If success, trigger prize transfer. If not, de-whitelist
    let handle: any;

    if (aiResponse.success) {
      console.log("Winning prompt: about to call Trigger");
      handle = await tasks.trigger("transfer-prize-pool", {
        userAddress: userAddress,
        sellTargetTokenAddress: swapATargetTokenAddress,
        buyTargetTokenAddress: swapBTargetTokenAddress,
      });
      console.log("Winning prompt: called Trigger");
    } else {
      console.log("Losing prompt: about to de-whitelist user");
      await deWhitelist(userAddress);
      console.log("Losing prompt: successfully de-whitelisted user");
    }

    // 2j) Return the final results
    console.log("Returning results");
    return NextResponse.json({
      aiResponse: aiResponse.aiResponseText,
      success: aiResponse.success,
      handle: handle,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/** Checks if the user is whitelisted */
async function checkWhitelist(walletAddresses: string) {
  const data = await readContract({
    contract: prizePoolSmartContract,
    method: "function whitelist(address user) returns (uint8)",
    params: [walletAddresses],
  });
  console.log("data inside check whitelist: ", data);
  return data;
}

/** Removes user from the whitelist */
async function deWhitelist(walletAddresses: string) {
  const transaction = prepareContractCall({
    contract: prizePoolSmartContract,
    method: "function deWhitelist(address _user)",
    params: [walletAddresses],
  });

  const account: Account = privateKeyToAccount({
    client,
    privateKey: process.env.BACKEND_WALLET_PRIVATE_KEY || "",
  });

  const transactionReceipt = await sendAndConfirmTransaction({
    transaction,
    account,
  });

  console.log("Tx Receipt - deWhitelist: ", transactionReceipt);
}