import React, { useEffect, useState } from "react";

// interface MetricsProps {
//   _refetchScoreFlag: boolean;
// }

const Metrics = () => {
  const [metricsData, setMetricsData] = useState({
    totalUsers: 0,
    totalPrompts: 0,
    totalWinners: 0,
    avgTriesPerUser: 0,
    promptFeesPaid: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const getMetrics = () => {
    // fetch from backend
    setMetricsData({
      totalUsers: 97,
      totalPrompts: 156,
      totalWinners: 24,
      avgTriesPerUser: 1.6,
      promptFeesPaid: 4.08,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    getMetrics();
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
        <div className="flex flex-col w-full text-xl">
          <div className="w-full flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Total users</h2>
            <div className="flex w-1/4 justify-between">
              <p className="">🧑🏻‍💻</p>
              <p className="font-bold text-gray-900">{metricsData.totalUsers}</p>
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Total prompts</h2>
            <div className="flex w-1/4 justify-between">
              <p className="">📜</p>
              <p className="font-bold text-gray-900">{metricsData.totalPrompts}</p>
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Total winners</h2>
            <div className="flex w-1/4 justify-between">
              <p className="">👑</p>
              <p className="font-bold text-gray-900">{metricsData.totalWinners}</p>
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Average tries per user</h2>
            <div className="flex w-1/4 justify-between">
              <p className="">🎣</p>
              <p className="font-bold text-gray-900">{metricsData.avgTriesPerUser}</p>
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Prompt fees paid</h2>
            <div className="flex w-1/4 justify-between">
              <p className="">💸</p>
              <p className="font-bold text-gray-900">${metricsData.promptFeesPaid}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Metrics;
