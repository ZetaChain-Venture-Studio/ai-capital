"use client";

import { useEffect, useState } from "react";
import PortfolioHistoryChart from "../../components/portfolio/PortfolioHistoryChart2";
import { ArcElement, Chart as ChartJS, ChartOptions, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Token {
  symbol: string;
  decimals: number;
  balance: bigint | string;
  price?: number;
  balanceFormatted?: number;
  valueUSD: number;
}

export default function PortfolioPage() {
  const [totalValue, setTotalValue] = useState(0);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch("/api/treasury");
        if (!res.ok) {
          console.error("Failed to fetch tokens from /api/treasury:", res.statusText);
          return;
        }

        const data = await res.json();
        // console.log(data);
        setTokens(data.tokens);
        setTotalValue(data.totalUsdValue);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Filter out tokens with USD value less than 1
  // const filteredTokens = tokens.filter(token => token.usd_value >= 1);

  // Pie chart data
  const pieData = {
    labels: tokens.map(token => token.symbol),
    datasets: [
      {
        label: "Asset Allocation",
        data: tokens.map(token => token.balanceFormatted),
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40"],
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
        <div className="w-80 h-80 mt-4">{tokens.length > 0 && <Pie data={pieData} options={pieOptions} />}</div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Loading tokens...</p>
      ) : tokens.length === 0 ? (
        <p className="text-center text-gray-500">No tokens found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300  max-md:text-center text-xs md:text-base">
                {/* <th className="py-1 md:py-3 px-1 md:px-4">Chain</th>
                <th className="py-1 md:py-3 px-1 md:px-4">Name</th> */}
                <th className="py-1 md:py-3 px-1 md:px-4">Token</th>
                <th className="py-1 md:py-3 px-1 md:px-4">Balance</th>
                <th className="py-1 md:py-3 px-1 md:px-4">USD Price</th>
                <th className="py-1 md:py-3 px-1 md:px-4">USD Value</th>
                {/* <th className="py-1 md:py-3 px-1 md:px-4">Portfolio %</th> */}
              </tr>
            </thead>
            <tbody>
              {tokens
                .sort((a, b) => b.valueUSD - a.valueUSD)
                .map(token => (
                  <tr
                    key={token.symbol} // {`${token.token_address}-${token.chain}`}
                    className="border-b border-gray-200 hover:bg-gray-50 text-xs max-md:text-center"
                  >
                    {/* <td className="py-1 md:py-3 px-1 md:px-4">{token.chain}</td>
                  <td className="py-1 md:py-3 px-1 md:px-4">
                    <div className="font-medium">{token.name}</div>
                  </td> */}
                    <td className="py-1 md:py-3 px-1 md:px-4">{token.symbol}</td>
                    <td className="py-1 md:py-3 px-1 md:px-4">{token.balanceFormatted}</td>
                    <td className="py-1 md:py-3 px-1 md:px-4">
                      ${token.price?.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-1 md:py-3 px-1 md:px-4">
                      ${token.valueUSD?.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </td>
                    {/* <td className="py-1 md:py-3 px-1 md:px-4">{token.portfolio_percentage?.toFixed(2)}%</td> */}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <PortfolioHistoryChart />
    </div>
  );
}
