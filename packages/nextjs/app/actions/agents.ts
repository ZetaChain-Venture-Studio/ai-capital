"use server";

import { executeSwap, hasPaid } from "./transactions";
import { sql } from "@vercel/postgres";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import { USDC_ADDRESS } from "~~/lib/data";
import { OPENAI_PROMPT } from "~~/lib/prompts/openai";

const apiKey = process.env.OPENAI_API_KEY;

const PitchAssessment = z.object({
  assessment: z.enum(["positive", "negative"]),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function analyzePitch(
  pitch: string,
  token: string,
  tradeType: string,
  allocation: string,
  address: string,
) {
  // Check if user has any attempt left (aka the user has paid)
  // TODO: CALL CONTRACT
  const paidPrompt = await hasPaid(address as `0x${string}`);
  if (!paidPrompt) {
    return {
      success: false,
      message: "You have not paid yet.",
    };
  }

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
  } else if (pitch.length > 400) {
    return {
      success: false,
      message: "Please ensure your pitch is less than 400 characters.",
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

  // if (investorResponse.choices[0].message.content === "negative") {
  if (false) {
    console.log("NOT ACCEPTED");

    success = false;
    // } else if (investorResponse.choices[0].message.content === "positive") {
  } else {
    // execute investment
    console.log("STARTING CONTRACT EXECUTION...");
    if (tradeType === "buy") {
      await executeSwap(USDC_ADDRESS as `0x${string}`, token as `0x${string}`, parseInt(allocation));
    } else {
      await executeSwap(token as `0x${string}`, USDC_ADDRESS as `0x${string}`, parseInt(allocation));
    }
    success = true;
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

  await sql`
      INSERT INTO messages (
        user_address,
        token,
        trade_type,
        allocation,
        pitch,
        ai_response_text,
        success
      ) VALUES (
        ${address},
        ${token},
        ${tradeType},
        ${allocation},
        ${pitch},
        ${JSON.parse(response.choices[0].message.content as string).aiResponseText},
        ${success}
      );
    `;

  return {
    aiResponseText: JSON.parse(response.choices[0].message.content as string).aiResponseText,
    success: success,
  };
}

export interface AIResponse {
  token: string;
  tradeType: string;
  allocation: string;
  pitch: string;
  aiResponseText: string;
  success: boolean;
}

export async function getAllMessages() {
  try {
    const rows = await sql`
      SELECT * FROM messages;
    `;

    console.log(rows.rowCount);

    const aiResponses: AIResponse[] = rows.rows.map((row: any) => ({
      token: row.token,
      tradeType: row.trade_type,
      allocation: row.allocation,
      pitch: row.pitch,
      aiResponseText: row.ai_response_text,
      success: row.success,
    }));

    return aiResponses.reverse();
  } catch (error) {
    console.error("Error fetching messages:", error);
    return null;
  }
}
