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

interface Token {
  symbol: string;
  usd_value: number | null;
}

interface PortfolioSnapshot {
  id: number;
  created_at: string;
  result: Token[];
}

interface ApiResponse {
  data: PortfolioSnapshot[];
  nextCursor: number | null;
}

type TimeframeOption = "1d" | "7d" | "30d" | "all";

export default function PortfolioHistoryChart() {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1d");

  const fetchSnapshots = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/paginated-portfolio", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData: ApiResponse = await response.json();
      setSnapshots(jsonData.data);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const reversedSnapshots = [...snapshots].reverse();

  const now = new Date();
  const filteredSnapshots = reversedSnapshots.filter(snapshot => {
    if (timeframe === "all") return true;

    const snapshotDate = new Date(snapshot.created_at);
    const daysDiff = (now.getTime() - snapshotDate.getTime()) / (1000 * 60 * 60 * 24);

    switch (timeframe) {
      case "1d":
        return daysDiff <= 1;
      case "7d":
        return daysDiff <= 7;
      case "30d":
        return daysDiff <= 30;
      default:
        return true;
    }
  });

  const snapshotLabels = filteredSnapshots.map(s => {
    const d = new Date(s.created_at);
    const localDate = d.toLocaleDateString([], {
      year: "2-digit",
      month: "numeric",
      day: "numeric",
    });
    const localTime = d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return `${localDate}\n${localTime}`;
  });

  const snapshotData = filteredSnapshots.map(s => s.result.reduce((acc, t) => acc + (t.usd_value ?? 0), 0));

  const data = {
    labels: snapshotLabels,
    datasets: [
      {
        label: "Portfolio Value (USD)",
        data: snapshotData,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
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
    <div className="p-4">
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
          onClick={() => handleTimeframeChange("1d")}
        >
          1 Day
        </button>
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
