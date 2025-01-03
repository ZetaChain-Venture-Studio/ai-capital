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
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // For pagination (you can tweak these)
  const [limit] = useState<number>(5);
  const [cursor, setCursor] = useState<number | null>(null);

  // NEW: Track which timeframe the user selected
  const [timeframe, setTimeframe] = useState<TimeframeOption>("all");

  const fetchSnapshots = async (limitValue: number, cursorValue: number | null) => {
    try {
      setIsLoading(true);
      let url = `/api/paginated-portfolio?limit=${limitValue}`;
      if (cursorValue !== null) {
        url += `&cursor=${cursorValue}`;
      }

      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const jsonData: ApiResponse = await response.json();

      if (!cursorValue) {
        // First time load
        setSnapshots(jsonData.data);
      } else {
        // Load older snapshots
        setSnapshots((prev) => [...prev, ...jsonData.data]);
      }

      setNextCursor(jsonData.nextCursor);
      setHasMore(!!jsonData.nextCursor);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots(limit, cursor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (nextCursor) {
      setCursor(nextCursor);
      fetchSnapshots(limit, nextCursor);
    }
  };

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
  const snapshotLabels = filteredSnapshots.map((s) =>
    new Date(s.created_at).toLocaleString()
  );

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
    <div style={{ padding: "1rem" }}>
      <h1>Portfolio History</h1>

      {/* Timeframe buttons */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => handleTimeframeChange("1d")}
          style={{ marginRight: "0.5rem" }}
        >
          1 Day
        </button>
        <button
          onClick={() => handleTimeframeChange("7d")}
          style={{ marginRight: "0.5rem" }}
        >
          7 Days
        </button>
        <button
          onClick={() => handleTimeframeChange("30d")}
          style={{ marginRight: "0.5rem" }}
        >
          30 Days
        </button>
        <button onClick={() => handleTimeframeChange("all")}>All</button>
      </div>

      <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
        <Line data={data} options={options} />
      </div>

      {isLoading && <p>Loading...</p>}
      {hasMore && !isLoading && (
        <button onClick={handleLoadMore}>Load More (Older Snapshots)</button>
      )}
      {!hasMore && snapshots.length > 0 && <p>All snapshots loaded</p>}
    </div>
  );
}
