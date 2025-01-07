import React, { useState, useEffect } from 'react';
import { ArcElement, Chart as ChartJS, ChartOptions, Legend, Tooltip } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type Token = {
  usd_value: number;
  symbol: string;
};

const TreasuryCard: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/portfolio');
        if (!res.ok) {
          console.error('Failed to fetch tokens from /api/portfolio:', res.statusText);
          return;
        }

        const allTokens: Token[] = await res.json();
        setTokens(allTokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Filter tokens with USD value >= 1
  const filteredTokens = tokens.filter((token) => token.usd_value >= 1);

  // Calculate total value
  const totalValue = filteredTokens.reduce((acc, token) => acc + token.usd_value, 0);

  // Pie chart data
  const pieData = {
    labels: filteredTokens.map((token) => token.symbol),
    datasets: [
      {
        label: 'Asset Allocation',
        data: filteredTokens.map((token) => token.usd_value),
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'],
        hoverOffset: 8,
      },
    ],
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div
      className="relative border rounded-lg shadow-lg p-6 bg-white max-w-md flex flex-col justify-center items-center"
      style={{ width: '100%', minWidth: '320px', minHeight: '200px' }}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full w-full">
          <div className="w-6 h-6 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex justify-between items-start w-full">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Treasury Pool 💰</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-base text-gray-500 mt-2">
              Total amount in the treasury for investments
            </p>
          </div>
          <div className="w-40 h-40">
            {filteredTokens.length > 0 && <Pie data={pieData} options={pieOptions} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasuryCard;
