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
export const CHAIN_IDS = [
    // "eth", // Ethereum mainnet
    // "sepolia", // Ethereum testnet
    "optimism", // Optimism mainnet
    // 'optimism-sepolia',// Optimism testnet
    // 'zksync-era',     // zkSync Era mainnet
    // 'zksync-era-sepolia', // zkSync Era testnet
  ];

export interface Token {
    token_address: string;
    symbol: string;
    name: string;
    logo: string;
    thumbnail: string;
    decimals: number;
    balance: string;
    possible_spam: boolean;
    verified_contract: boolean;
    balance_formatted: string;
    usd_price: number;
    usd_price_24hr_percent_change: number;
    usd_price_24hr_usd_change: number;
    usd_value: number;
    usd_value_24hr_usd_change: number;
    native_token: boolean;
    portfolio_percentage: number;
    // We add a custom property to track the chain this token is from
    chain?: string;
  }
  
export interface PortfolioResponse {
    result: Token[];
    id?: number;
  }
