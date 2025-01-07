"use client";

import { useState } from "react";
import { ValidationResult, validateAllocation } from "../../lib/utils";

interface AllocationInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AllocationInput({ value, onChange }: AllocationInputProps) {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Reset validation if the value is "1" or "2"
    if (inputValue === "1" || inputValue === "2") {
      setValidation({ isValid: true, message: "" });
    } else {
      const result = validateAllocation(inputValue);
      setValidation(result);
    }

    // Always propagate the change
    onChange(e);
  };

  return (
    <div>
      <label htmlFor="allocation" className="block text-xs font-medium text-gray-600 mb-2">
        Allocation Percentage (0 - 2%)
      </label>
      <div className="relative">
        <input
          type="number"
          id="allocation"
          name="allocation"
          min="1"
          max="2"
          step="1"
          required
          value={value}
          onChange={handleChange}
          className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white w-full rounded-md border py-1 px-2 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-transparent ${
            !validation.isValid ? "border-red-300 focus:ring-red-500" : "border-gray-300 "
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500">%</span>
        </div>
      </div>
      {!validation.isValid && validation.message && <p className="mt-1 text-sm text-red-600">{validation.message}</p>}
    </div>
  );
}
