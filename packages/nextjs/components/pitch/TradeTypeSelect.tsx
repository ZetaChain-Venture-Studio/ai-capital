"use client";

import React from "react";

interface TradeTypeSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TradeTypeSelect({ value, onChange }: TradeTypeSelectProps) {
  return (
    <div className="w-full max-w-xs">
      <label className="block text-xs font-medium text-gray-600 mb-2">Trade Type</label>
      <div className="relative flex items-center justify-between w-full bg-gray-200 rounded-full p-1">
        {/* Buy Option */}
        <label
          className={`w-1/2 text-center cursor-pointer py-1 text-xs rounded-full ${
            value === "buy" ? "bg-green-500 text-white" : "text-gray-700"
          }`}
        >
          <input
            type="radio"
            name="tradeType"
            value="buy"
            checked={value === "buy"}
            onChange={onChange}
            className="hidden"
          />
          Buy
        </label>

        {/* Sell Option */}
        <label
          className={`w-1/2 text-center cursor-pointer py-1 text-xs rounded-full ${
            value === "sell" ? "bg-red-500 text-white" : "text-gray-700"
          }`}
        >
          <input
            type="radio"
            name="tradeType"
            value="sell"
            checked={value === "sell"}
            onChange={onChange}
            className="hidden"
          />
          Sell
        </label>
      </div>
    </div>
  );
}
