import React, { useEffect, useState } from "react";

const BountyCard: React.FC = () => {
  const [walletAmount, setWalletAmount] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWalletAmount = async () => {
      try {
        const res = await fetch("/api/wallet");
        if (!res.ok) {
          console.error("Failed to fetch wallet amount:", res.statusText);
          return;
        }

        const data = await res.json();
        setWalletAmount(Number(data.bounty).toFixed(2));
      } catch (error) {
        console.error("Error fetching wallet amount:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletAmount();
  }, []);

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
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-yellow-500">Bounty To Win 🤑</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">${walletAmount.toLocaleString()} USDC</p>
          <p className="text-base text-gray-500 mt-2">Convince Lucy to invest in your token and win the bounty!</p>
        </div>
      )}
    </div>
  );
};

export default BountyCard;
