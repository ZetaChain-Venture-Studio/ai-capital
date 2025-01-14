import React, { useEffect, useState } from "react";
import { ArcElement, Chart as ChartJS, ChartOptions, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import { Token } from "~~/types/token";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TrasuryProps {
  _refetchScoreFlag: boolean;
}

const TreasuryCard = ({ _refetchScoreFlag }: TrasuryProps) => {
  const [totalValue, setTotalValue] = useState(0);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        // const res = await fetch("/api/portfolio");
        const res = await fetch("/api/treasury");
        if (!res.ok) {
          console.error("Failed to fetch tokens from /api/portfolio:", res.statusText);
          return;
        }
        const data = await res.json();
        setTokens(data.tokens);
        setTotalValue(data.totalUsdValue.toFixed(2));
        // console.log(data);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [_refetchScoreFlag]);

  // Filter tokens with USD value >= 1
  // const filteredTokens = tokens.filter(token => token.usd_value >= 1);

  const generateColor = (index: number, total: number) => {
    const hue = (index / total) * 360;
    return {
      backgroundColor: `hsla(${hue}, 70%, 50%, 1)`,
      borderColor: `hsla(${hue}, 70%, 40%, 1)`,
      hoverColor: `hsla(${hue}, 70%, 50%, 0.8)`,
    };
  };

  const pieData = {
    labels: tokens.map(token => token.symbol),
    datasets: [
      {
        label: "Allocation (USD)",
        data: tokens.map(token => token.valueUSD?.toFixed(2)),
        backgroundColor: tokens.map((_, index) => generateColor(index, tokens.length).backgroundColor),
        borderColor: tokens.map((_, index) => generateColor(index, tokens.length).borderColor), // Bordes oscuros
        borderWidth: 2, // Espesor del borde
        hoverBackgroundColor: tokens.map((_, index) => generateColor(index, tokens.length).hoverColor),
        hoverOffset: 8,
      },
    ],
  };

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        // display: false,
      },
    },
  };

  return (
    <div
      className="relative border rounded-lg shadow-lg p-6 bg-white max-w-md flex flex-col justify-center items-center"
      style={{ width: "100%", minWidth: "320px", minHeight: "200px" }}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full w-full">
          <div className="w-6 h-6 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex justify-between items-start w-full">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Treasury Pool 💰</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">${totalValue.toLocaleString()}</p>
            <p className="text-base text-gray-500 mt-2">Total amount in the treasury for investments</p>
          </div>
          <div className="w-40 h-40">{tokens.length > 0 && <Pie data={pieData} options={pieOptions} />}</div>
        </div>
      )}
    </div>
  );
};

export default TreasuryCard;
