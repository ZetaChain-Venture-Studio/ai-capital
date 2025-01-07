import React, { useState, useEffect } from 'react';

type Token = {
  usd_value: number;
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

  return (
    <div className="border rounded-lg shadow-lg p-6 bg-white max-w-md">
      {isLoading ? (
        <div className="mt-4 flex justify-center mb-10">
          <div className="w-6 h-6 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-gray-800">Treasury Pool</h2>
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${totalValue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This is the total amount available in the treasury for various operations and investments.
          </p>
        </>
      )}
    </div>
  );
};

export default TreasuryCard;
