"use server";

import { sql } from "@vercel/postgres";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { createWalletClient, getContract, http, toHex } from "viem";
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
export async function analyzePitch(
  pitch: string,
  token: string,
  tradeType: string,
  allocation: string,
  address: string,
) {
  // Check if user has any attempt left (aka the user has paid)
  // TODO: CALL CONTRACT
  // address: "0xb396b402AD30e794e35E05A08960Af07B7D18334",
  const contract = await getContract({
    client: walletClient,
    address: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    abi: [
      {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [],
        name: "AccessControlBadConfirmation",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "neededRole",
            type: "bytes32",
          },
        ],
        name: "AccessControlUnauthorizedAccount",
        type: "error",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "bytes32",
            name: "previousAdminRole",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "bytes32",
            name: "newAdminRole",
            type: "bytes32",
          },
        ],
        name: "RoleAdminChanged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
          },
        ],
        name: "RoleGranted",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
          },
        ],
        name: "RoleRevoked",
        type: "event",
      },
      {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [
          {
            internalType: "bytes32",
            name: "",
            type: "bytes32",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "SERVER_ROLE",
        outputs: [
          {
            internalType: "bytes32",
            name: "",
            type: "bytes32",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "TREASURE_ROLE",
        outputs: [
          {
            internalType: "bytes32",
            name: "",
            type: "bytes32",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "decWhitelist",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
        ],
        name: "getRoleAdmin",
        outputs: [
          {
            internalType: "bytes32",
            name: "",
            type: "bytes32",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "hasRole",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "price",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "priceOP",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "priceZK",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "callerConfirmation",
            type: "address",
          },
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "server",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_server",
            type: "address",
          },
        ],
        name: "setServer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes4",
            name: "interfaceId",
            type: "bytes4",
          },
        ],
        name: "supportsInterface",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        name: "whitelist",
        outputs: [
          {
            internalType: "uint8",
            name: "",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        stateMutability: "payable",
        type: "receive",
      },
    ],
  });

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
    // if (false) {
    success = false;
  } else if (investorResponse.choices[0].message.content === "positive") {
    // } else {
    // execute investment
    // TODO

    console.log("price", contract.read.price, "priceOP", contract.read.priceOP);

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
        ${address},
        ${token},
        ${tradeType},
        ${allocation},
        ${pitch},
        ${JSON.parse(response.choices[0].message.content as string).aiResponseText},
        ${success}
      );
    `;

  console.log("Insert successful:", result);

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
