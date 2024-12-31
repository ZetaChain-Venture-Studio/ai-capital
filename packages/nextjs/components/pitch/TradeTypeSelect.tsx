"use client";

interface TradeTypeSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TradeTypeSelect({ value, onChange }: TradeTypeSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Trade Type</label>
      <div className="space-x-4">
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="tradeType"
            value="buy"
            checked={value === "buy"}
            onChange={onChange}
            className="form-radio text-gray-900 accent-blue-500"
          />
          <span className="ml-2">Buy</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="tradeType"
            value="sell"
            checked={value === "sell"}
            onChange={onChange}
            className="form-radio text-gray-900 accent-blue-500"
          />
          <span className="ml-2">Sell</span>
        </label>
      </div>
    </div>
  );
}
