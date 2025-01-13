"use client";

// import { testTokens } from "../../lib/data";
import { tokens } from "~~/lib/constants";

interface TokenSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TokenSelect({ value, onChange }: TokenSelectProps) {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSymbol = e.target.value;
    const selectedToken = tokens.find(item => item.symbol === selectedSymbol);
    if (selectedToken) {
      onChange({ target: { value: selectedToken.address, name: "token" } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div>
      <label htmlFor="token-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Token
      </label>
      <div>
        <select
          id="token-select"
          name="token-select"
          onChange={handleSelectChange}
          value={tokens.find(token => token.address === value)?.symbol || ""}
          className="bg-white w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="">Select your token</option>
          {tokens
            .filter(item => item.symbol !== "USDC")
            .map(item => (
              <option key={item.symbol} value={item.symbol}>
                {item.symbol}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
