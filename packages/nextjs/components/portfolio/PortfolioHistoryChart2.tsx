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

// interface Token {
//   symbol: string;
//   usd_value: number | null;
// }

interface PortfolioSnapshot {
  id: number;
  date: string;
  totalValueUsd: number;
  btcValueUsd: number;
  ethValueUsd: number;
  usdValueUsd: number;
}

type TimeframeOption = "1d" | "7d" | "30d" | "all";

export default function PortfolioHistoryChart() {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("7d");

  const fetchSnapshots = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/portfolio", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      console.log(jsonData);
      const transformedSnapshots: PortfolioSnapshot[] = jsonData.map((entry: any) => ({
        id: entry.id,
        date: entry.date,
        totalValueUsd: entry.total_value_usd,
        btcValueUsd: entry.btc_value,
        ethValueUsd: entry.eth_value,
        usdValueUsd: entry.usd_value,
      }));
      setSnapshots(transformedSnapshots);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const snapshotLabels = snapshots.map(s => s.date);
  // const snapshotData = snapshots.map(s => s.totalValueUsd);

  const data = {
    labels: snapshotLabels,
    datasets: [
      {
        label: "Portfolio Value (USD)",
        data: snapshots.map(s => s.totalValueUsd),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
      {
        label: "BTC Value (USD)",
        data: snapshots.map(s => s.btcValueUsd),
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        fill: true,
      },
      {
        label: "ETH Value (USD)",
        data: snapshots.map(s => s.ethValueUsd),
        borderColor: "rgba(54,162,235,1)",
        backgroundColor: "rgba(54,162,235,0.2)",
        fill: true,
      },
      {
        label: "USD Balance",
        data: snapshots.map(s => s.usdValueUsd),
        borderColor: "rgba(255,206,86,1)",
        backgroundColor: "rgba(255,206,86,0.2)",
        fill: true,
      },
    ],
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

  const handleTimeframeChange = (newTimeframe: TimeframeOption) => {
    setTimeframe(newTimeframe);
  };

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
        {/* <button
          className={`px-3 py-2 ${timeframe === "1d" ? "bg-blue-600" : "bg-gray-600"} text-white rounded max-md:text-sm`}
          onClick={() => handleTimeframeChange("1d")}
        >
          1 Day
        </button> */}
        <button
          className={`px-3 py-2 ${timeframe === "7d" ? "bg-blue-600" : "bg-gray-600"} text-white rounded max-md:text-sm`}
          onClick={() => handleTimeframeChange("7d")}
        >
          7 Days
        </button>
        <button
          className={`px-3 py-2 ${timeframe === "30d" ? "bg-blue-600" : "bg-gray-600"} text-white rounded max-md:text-sm`}
          onClick={() => handleTimeframeChange("30d")}
        >
          30 Days
        </button>
        <button
          className={`px-3 py-2 ${timeframe === "all" ? "bg-blue-600" : "bg-gray-600"} text-white rounded max-md:text-sm`}
          onClick={() => handleTimeframeChange("all")}
        >
          All
        </button>
      </div>
    </div>
  );
}
