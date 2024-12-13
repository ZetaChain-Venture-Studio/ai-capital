'use client';

import { mockPortfolio } from '../../lib/data';

interface TokenSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function TokenSelect({ value, onChange }: TokenSelectProps) {
  return (
    <div>
      <label
        htmlFor="token"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Select Token
      </label>
      <select
        id="token"
        name="token"
        required
        value={value}
        onChange={onChange}
        className="bg-white w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      >
        <option value="">Select a token</option>
        {mockPortfolio.map((item) => (
          <option key={item.symbol} value={item.symbol}>
            {item.token} ({item.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}