import React, { useState, useEffect } from 'react';

const BountyCard: React.FC = () => {
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWalletAmount = async () => {
      try {
        const res = await fetch('/api/wallet');
        if (!res.ok) {
          console.error('Failed to fetch wallet amount:', res.statusText);
          return;
        }

        const data = await res.json();
        setWalletAmount(data.amount);
      } catch (error) {
        console.error('Error fetching wallet amount:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletAmount();
  }, []);

  return (
    <div className="border rounded-lg shadow-lg p-6 bg-white max-w-md">
      {isLoading ? (
        <div className="mt-4 flex justify-center mb-10">
          <div className="w-6 h-6 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-yellow-500">Bounty Wallet 🤑 </h2>         
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${walletAmount.toLocaleString()} USDC
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This is the amount available in the wallet to be transferred if you successfully
            convince Lucy to invest in a token.
          </p>
        </div>
      )}
    </div>
  );
};

export default BountyCard;
