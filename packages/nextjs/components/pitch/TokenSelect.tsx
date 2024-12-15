"use client";

import { mockPortfolio } from "../../lib/data";

interface TokenSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TokenSelect({ value, onChange }: TokenSelectProps) {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSymbol = e.target.value;
    const selectedToken = mockPortfolio.find(item => item.symbol === selectedSymbol);
    if (selectedToken) {
      // Simulate an event for input change with token address
      onChange({ target: { value: selectedToken.address, name: "token" } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div>
      <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
        Enter or Select Token
      </label>
      <div className="flex gap-2">
        {/* Text Input */}
        <input
          type="text"
          id="token"
          name="token"
          placeholder="Enter token address"
          value={value}
          onChange={onChange}
          className="bg-white flex-1 rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />

        {/* Dropdown List */}
        <select
          id="token-select"
          name="token-select"
          onChange={handleSelectChange}
          className="bg-white w-1/3 rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="">Your token</option>
          {mockPortfolio.map(item => (
            <option key={item.symbol} value={item.symbol}>
              {item.token} ({item.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Informational Note */}
      <p className="mt-2 text-sm text-gray-500">Token must be tradable on Uniswap</p>
    </div>
  );
}
