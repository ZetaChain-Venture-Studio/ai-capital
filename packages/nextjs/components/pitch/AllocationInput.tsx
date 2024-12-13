'use client';

import { ValidationResult, validateAllocation } from '../../lib/utils';
import { useState } from 'react';

interface AllocationInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AllocationInput({ value, onChange }: AllocationInputProps) {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = validateAllocation(e.target.value);
    setValidation(result);
    if (result.isValid) {
      onChange(e);
    }
  };

  return (
    <div>
      <label
        htmlFor="allocation"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Allocation Percentage (0-2%)
      </label>
      <div className="relative">
        <input
          type="number"
          id="allocation"
          name="allocation"
          min="0"
          max="2"
          step="0.1"
          required
          value={value}
          onChange={handleChange}
          className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            !validation.isValid
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300'
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500">%</span>
        </div>
      </div>
      {!validation.isValid && validation.message && (
        <p className="mt-1 text-sm text-red-600">{validation.message}</p>
      )}
      <p className="mt-1 text-sm text-gray-500">
        Limited to 2% to manage risk exposure
      </p>
    </div>
  );
}