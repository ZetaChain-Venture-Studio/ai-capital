"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Token {
  symbol: string;
  usd_value: number | null;
}

interface PortfolioSnapshot {
  id: number;
  created_at: string; // or Date if you parse it
  result: Token[];
}

interface ApiResponse {
  data: PortfolioSnapshot[];
  nextCursor: number | null;
}

// Possible timeframe options for filtering
type TimeframeOption = "1d" | "7d" | "30d" | "all";

export default function HistoryPage() {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // NEW: Track which timeframe the user selected
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // snapshots are in DESC order by ID/time (latest first).
  // Reverse them for the chart so earliest is on the left.
  const reversedSnapshots = [...snapshots].reverse();

  /**
   * FILTER BY TIMEFRAME
   * We'll filter out snapshots older than the chosen timeframe
   * from the *current* time.
   */
  const now = new Date();
  const filteredSnapshots = reversedSnapshots.filter((snapshot) => {
    // If timeframe is "all", just keep everything
    if (timeframe === "all") return true;

    const snapshotDate = new Date(snapshot.created_at);
    // Difference in days
    const daysDiff = (now.getTime() - snapshotDate.getTime()) / (1000 * 60 * 60 * 24);

    switch (timeframe) {
      case "1d":
        return daysDiff <= 1;
      case "7d":
        return daysDiff <= 7;
      case "30d":
        return daysDiff <= 30;
      default:
        return true; // fallback (shouldn't happen)
    }
  });

  // X-Axis Labels: Use the filtered snapshots' created_at
  const snapshotLabels = filteredSnapshots.map((s) => {
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

  // Data: sum up usd_value from result for each snapshot
  const snapshotData = filteredSnapshots.map((s) =>
    s.result.reduce((acc, t) => acc + (t.usd_value ?? 0), 0)
  );

  // Chart.js dataset
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

  // Chart.js options
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

  // Handler to change timeframe
  const handleTimeframeChange = (newTimeframe: TimeframeOption) => {
    setTimeframe(newTimeframe);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Portfolio History</h1>
      <div className="w-9/12 mx-auto my-8">
        <Line data={data} options={options} />
      </div>
      <div className="flex gap-2 justify-center">
        <button
          className={`px-3 py-2 ${
            timeframe === "1d" ? "bg-blue-600" : "bg-gray-600"
          } text-white rounded`}
          onClick={() => handleTimeframeChange("1d")}
        >
          1 Day
        </button>
        <button
          className={`px-3 py-2 ${
            timeframe === "7d" ? "bg-blue-600" : "bg-gray-600"
          } text-white rounded`}
          onClick={() => handleTimeframeChange("7d")}
        >
          7 Days
        </button>
        <button
          className={`px-3 py-2 ${
            timeframe === "30d" ? "bg-blue-600" : "bg-gray-600"
          } text-white rounded`}
          onClick={() => handleTimeframeChange("30d")}
        >
          30 Days
        </button>
        <button
          className={`px-3 py-2 ${
            timeframe === "all" ? "bg-blue-600" : "bg-gray-600"
          } text-white rounded`}
          onClick={() => handleTimeframeChange("all")}
        >
          All
        </button>
      </div>
      {isLoading && (
        <div className="mt-4 flex justify-center">
          <div className="w-6 h-6 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
