"use client";

// import { useEffect } from "react";
import PortfolioHistoryChart from "~~/components/portfolio/PortfolioHistoryChart2";

export default function WalletEventsPage() {
  async function fetchPortfolio() {
    const endpoint = "api/query-portfolio";

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer s3TPXxBZeYKg6iL3mpdPukoALay2o0Fp`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Portfolio Data:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
      throw error;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <button onClick={fetchPortfolio}>call</button>
      <PortfolioHistoryChart />
    </div>
  );
}
