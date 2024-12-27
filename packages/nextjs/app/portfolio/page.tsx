"use client"; // If you're using Next.js app router

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Token {
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

interface PortfolioResponse {
  result: Token[];
}

const CHAIN_IDS = [
  // "eth", // Ethereum mainnet
  // "sepolia", // Ethereum testnet
  "optimism", // Optimism mainnet
  // 'optimism-sepolia',// Optimism testnet
  // 'zksync-era',     // zkSync Era mainnet
  // 'zksync-era-sepolia', // zkSync Era testnet
];

export default function PortfolioPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      const apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
      if (!apiKey) {
        throw new Error("MORALIS_API_KEY environment variable not set.");
      }

      const walletAddress = "0xb13b7A60C88e1Ba2a204423aB420C60ACBA62c53";
      try {
        const promises = CHAIN_IDS.map(async (chain) => {
          const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/tokens?chain=${chain}`;
          const res = await fetch(url, {
            method: "GET",
            headers: {
              accept: "application/json",
              "X-API-Key": apiKey,
            },
          });

          if (!res.ok) {
            console.error(`Failed to fetch tokens for chain ${chain}:`, res.statusText);
            return [];
          }

          const data = (await res.json()) as PortfolioResponse;
          return (data.result || []).map((token) => ({ ...token, chain }));
        });

        const results = await Promise.all(promises);
        const allTokens = results.flat();
        setTokens(allTokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Filter out tokens with USD value less than 1
  const filteredTokens = tokens.filter(token => token.usd_value >= 1);

  // Compute total USD value across all tokens
  const totalValue = filteredTokens.reduce((acc, token) => acc + token.usd_value, 0);

  // Prepare data for Pie chart
  const pieData = {
    labels: filteredTokens.map((token) => token.symbol),
    datasets: [
      {
        label: "Asset Allocation",
        data: filteredTokens.map((token) => token.usd_value),
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#ffce56",
          "#4bc0c0",
          "#9966ff",
          "#ff9f40",
          // add more colors if you have many tokens
        ],
        hoverOffset: 8,
      },
    ],
  };

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AI Agent Portfolio</h1>

      {/* Pie Chart Section */}
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-2xl font-semibold mb-2">Hedge Fund Portfolio</h2>
        <p className="text-gray-600">
          Total Value Locked (TVL):{" "}
          <span className="font-semibold text-blue-600">
            ${totalValue.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC
          </span>
        </p>
        <h3 className="text-lg font-semibold mt-4">Asset Allocation</h3>
        <div className="w-80 h-80 mt-4">
          {/* Only show pie chart if we have data */}
          {filteredTokens.length > 0 && (
            <Pie data={pieData} options={pieOptions} />
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Loading tokens...</p>
      ) : filteredTokens.length === 0 ? (
        <p className="text-center text-gray-500">No tokens found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-3 px-4">Chain</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">USD Price</th>
                <th className="py-3 px-4">USD Value</th>
                <th className="py-3 px-4">Portfolio %</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map((token) => (
                <tr
                  key={`${token.token_address}-${token.chain}`}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{token.chain}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{token.name}</div>
                  </td>
                  <td className="py-3 px-4">{token.symbol}</td>
                  <td className="py-3 px-4">{token.balance_formatted}</td>
                  <td className="py-3 px-4">
                    ${token.usd_price?.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    ${token.usd_value?.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    {token.portfolio_percentage.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
