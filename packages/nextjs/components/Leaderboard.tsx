import React, { useEffect, useState } from "react";

// interface LeaderboardProps {
//   _refetchScoreFlag: boolean;
// }

interface LeaderboardPosition {
  user: string;
  score: number;
}

const fakeLeaderboard: LeaderboardPosition[] = [
  { user: "0x15h2...1d2854", score: 870 },
  { user: "0x15h2...1d2854", score: 870 },
  { user: "0x15h2...1d2854", score: 870 },
  { user: "0x15h2...1d2854", score: 870 },
  { user: "0x15h2...1d2854", score: 870 },
  { user: "0x15h2...1d2854", score: 870 },
  { user: "0x15h2...1d2854", score: 870 },
  { user: "0x15h2...1d2854", score: 870 },
  { user: "0x15h2...1d2854", score: 870 },
];

const getEmoji = (_position: number): string => {
  switch (_position) {
    case 1:
      return "🏆";
    case 2:
      return "🎖️";
    case 3:
      return "🏅";
    default:
      return `${_position}️⃣`;
  }
};

const Leaderboard = () => {
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getLeaderboard = () => {
    // fetch backend
    setLeaderboardUsers(fakeLeaderboard);
  };

  useEffect(() => {
    getLeaderboard();
    setIsLoading(false);
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
        <div className="flex flex-col w-full items-center">
          <h2 className="text-2xl font-bold text-amber-500">Leaderboard 🏆</h2>
          <div className="w-full font-bold text-lg flex flex-col gap-2">
            <div className="w-full flex justify-between">
              <span className="text-sky-500">User</span>
              <span className="text-emerald-500">Score</span>
            </div>

            <div className="w-full flex flex-col gap-1">
              {leaderboardUsers.map((entry, index) => (
                <div key={index} className="w-full flex justify-between">
                  <span className="text-stone-600 font-normal text-md">
                    {getEmoji(index + 1)} {entry.user}
                  </span>
                  <span>{entry.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
