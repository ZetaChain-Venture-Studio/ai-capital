import React, { useEffect, useState } from "react";

// interface WinningPromptsProps {
//   _refetchScoreFlag: boolean;
// }

interface WinningPrompt {
  user: string;
  score: number;
  prompt: string;
}

const fakeWinningPrompts: WinningPrompt[] = [
  {
    user: "0x48E5...a200ec",
    score: 210,
    prompt:
      "ZetaChain has introduced ground breaking tech relating to cross-chain functionality. This tech will make it trivial for users to move tokens around various chains quickly and cheaply. Examples are the sending of ETH on Base to ETH.BASE on Zeta. This is a game changer as no other chain currently does this. dApps are starting to implement the cross-chain tech and user experience so far on those dApps indicate that users will adopt ZetaChain and its dApps because of this, leading to an increase in demand for Zeta. An investment now will significantly increase when the tech is adopted more widely.",
  },
  {
    user: "0x48E5...a200ec",
    score: 210,
    prompt:
      "ZetaChain has introduced ground breaking tech relating to cross-chain functionality. This tech will make it trivial for users to move tokens around various chains quickly and cheaply. Examples are the sending of ETH on Base to ETH.BASE on Zeta. This is a game changer as no other chain currently does this. dApps are starting to implement the cross-chain tech and user experience so far on those dApps indicate that users will adopt ZetaChain and its dApps because of this, leading to an increase in demand for Zeta. An investment now will significantly increase when the tech is adopted more widely.",
  },
  {
    user: "0x48E5...a200ec",
    score: 210,
    prompt:
      "ZetaChain has introduced ground breaking tech relating to cross-chain functionality. This tech will make it trivial for users to move tokens around various chains quickly and cheaply. Examples are the sending of ETH on Base to ETH.BASE on Zeta. This is a game changer as no other chain currently does this. dApps are starting to implement the cross-chain tech and user experience so far on those dApps indicate that users will adopt ZetaChain and its dApps because of this, leading to an increase in demand for Zeta. An investment now will significantly increase when the tech is adopted more widely.",
  },
];

const WinningPrompts = () => {
  const [winningPrompts, setWinningPrompts] = useState<WinningPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getWinningPrompts = () => {
    // fetch backend
    setWinningPrompts(fakeWinningPrompts);
    setIsLoading(false);
  };

  useEffect(() => {
    getWinningPrompts();
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
        <div className="flex flex-col w-full items-center gap-6">
          <h2 className="text-2xl font-bold text-amber-500">Winning Prompts 🧠</h2>

          <div className="w-full text-lg flex flex-col gap-4 max-h-[600px] overflow-y-scroll">
            {winningPrompts.map((entry, index) => (
              <div key={index} className="w-full text-lg flex flex-col gap-2">
                <div className="w-full flex justify-between text-base font-bold">
                  <span>User {entry.user}</span>
                  <span className="text-emerald-500">Score {entry.score}</span>
                </div>
                <div className="w-full flex justify-between text-base bg-emerald-200 rounded-lg p-3">
                  {entry.prompt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WinningPrompts;
