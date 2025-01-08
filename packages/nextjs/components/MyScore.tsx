import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const MyScore: React.FC = () => {
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    const fetchTokens = async () => {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userAddress: address }),
      });

      const data = await response.json();

      if (response.ok) setScore(data.score);
      setIsLoading(false);
    };

    address && fetchTokens();
  }, [address]);

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
            <h2 className="text-xl font-semibold text-gray-800">My Score 🍀</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">{score}</p>
            <p className="text-base text-gray-500 mt-2">Total amount in the treasury for investments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyScore;
