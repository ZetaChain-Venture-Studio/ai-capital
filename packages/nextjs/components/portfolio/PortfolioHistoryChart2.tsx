"use client";

import React, { useEffect, useState } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TokenValue {
  symbol: string;
  usdValue: string;
}

interface PortfolioSnapshot {
  id: number;
  date: string;
  tokenValues: TokenValue[];
}

const tokenKeys = [
  { key: "total_value_usd", symbol: "Total USD" },
  { key: "bnb_value", symbol: "BNB" },
  { key: "btc_value", symbol: "BTC" },
  { key: "dai_value", symbol: "DAI" },
  { key: "eth_value", symbol: "ETH" },
  { key: "pepe_value", symbol: "PEPE" },
  { key: "pol_value", symbol: "POL" },
  { key: "shib_value", symbol: "SHIB" },
  { key: "sol_value", symbol: "SOL" },
  { key: "ulti_value", symbol: "ULTI" },
  { key: "usd_value", symbol: "USDC" },
  { key: "zeta_value", symbol: "ZETA" },
];

type TimeframeOption = "1d" | "7d" | "30d" | "all";

export default function PortfolioHistoryChart() {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1d");
  const [limit, setLimit] = useState(24);

  const fetchSnapshots = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/paginated-portfolio?limit=${limit}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      console.log(jsonData);

      const portfolioSnapshots: PortfolioSnapshot[] = jsonData.map((item: any) => ({
        id: item.id,
        date: item.date,
        tokenValues: tokenKeys.map(({ key, symbol }) => ({
          symbol,
          usdValue: item[key],
        })),
      }));
      setSnapshots(portfolioSnapshots);
      // console.log(portfolioSnapshots)
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, [limit]);

  const generateColor = (index: number, total: number) => {
    const hue = (index / total) * 360;
    return {
      borderColor: `hsl(${hue}, 70%, 50%)`,
      backgroundColor: `hsl(${hue}, 70%, 80%)`,
    };
  };

  const totalTokens = tokenKeys.length;

  const datasets = tokenKeys.map(({ symbol }, index) => {
    const { borderColor, backgroundColor } = generateColor(index, totalTokens);
    return {
      label: `${symbol} Value (USD)`,
      data: snapshots.map(snapshot => {
        const tokenValue = snapshot.tokenValues.find(t => t.symbol === symbol);
        return tokenValue?.usdValue || 0;
      }),
      borderColor,
      backgroundColor,
      // fill: true,
    };
  });

  const data = {
    labels: snapshots.map(snapshot => {
      const date = new Date(Number(snapshot.date) * 1000);
      return date.toLocaleString("en-US", {
        // weekday: "short",
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }),
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Historical Portfolio Value over Time",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Value (USD)" },
      },
      x: {
        title: { display: true, text: "Time (earliest → latest)" },
      },
    },
  };

  const handleTimeframeChange = (newTimeframe: TimeframeOption, _limit: number) => {
    setTimeframe(newTimeframe);
    setLimit(_limit);
  };

  // const callQueryPortfol = async () => {
  //   await fetch("/api/query-portfolio");
  // };

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="w-full md:w-9/12 my-8 flex justify-center">
        <Line data={data} options={options} />
      </div>
      {isLoading && (
        <div className="mt-4 flex justify-center mb-10">
          <div className="w-6 h-6 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      <div className="flex gap-2 justify-center">
        <button
          className={`px-3 py-2 ${timeframe === "1d" ? "bg-blue-600" : "bg-gray-600"} text-white rounded max-md:text-sm`}
          onClick={() => handleTimeframeChange("1d", 24)}
        >
          1 Day
        </button>
        <button
          className={`px-3 py-2 ${timeframe === "7d" ? "bg-blue-600" : "bg-gray-600"} text-white rounded max-md:text-sm`}
          onClick={() => handleTimeframeChange("7d", 168)}
        >
          7 Days
        </button>
        <button
          className={`px-3 py-2 ${timeframe === "30d" ? "bg-blue-600" : "bg-gray-600"} text-white rounded max-md:text-sm`}
          onClick={() => handleTimeframeChange("30d", 720)}
        >
          30 Days
        </button>
        <button
          className={`px-3 py-2 ${timeframe === "all" ? "bg-blue-600" : "bg-gray-600"} text-white rounded max-md:text-sm`}
          onClick={() => handleTimeframeChange("all", 999)}
        >
          All
        </button>
      </div>

      {/* <button onClick={callQueryPortfol}>call</button> */}
    </div>
  );
}
