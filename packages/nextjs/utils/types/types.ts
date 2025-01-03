// src/types/AIResponse.ts
export interface AIResponse {
    id: number;
    userAddress: string;
    token: string;
    tradeType: string;
    allocation: string;
    pitch: string;
    aiResponseText: string;
    success: boolean;
    timestamp: string;
  }
  









export interface VerifyTransactionOptions {
  txHash: string;
  requiredFee: string; // Fee in ETH as string (like: "0.01")
  expectedSender: string; // User wallet address
  expectedNonce: string; // nonce
}