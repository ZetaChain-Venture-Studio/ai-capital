"use client";

import React from 'react';

interface PitchTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function PitchTextarea({ value, onChange }: PitchTextareaProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const charCode = e.charCode;
    if (!isValidCharacter(charCode)) {
      e.preventDefault();
    }
  };

  const isValidCharacter = (charCode: number) => {
    const alphanumeric = (charCode >= 48 && charCode <= 57) || // 0-9
                         (charCode >= 65 && charCode <= 90) || // A-Z
                         (charCode >= 97 && charCode <= 122);  // a-z
    const specialChars = [32, 34, 44, 46, 45, 47, 40, 41, 33]; // space, ", ,, ., -, /, (, ), !
    return alphanumeric || specialChars.includes(charCode);
  };

  return (
    <div>
      <label htmlFor="pitch" className="block text-sm font-medium text-gray-700 mb-2">
        Investment Pitch
      </label>
      <textarea
        id="pitch"
        name="pitch"
        required
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        rows={4}
        maxLength={400}
        className=" bg-white w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        placeholder="Explain your investment thesis..."
      />    
      <p className="mt-2 text-sm text-gray-500">At least 50 characters, maximum of 400 characters</p>
    </div>
  );
}
