"use client";

import { useState } from "react";
import Link from "next/link";

type OnboardingPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

function OnboardingPopup({ isOpen, onClose }: OnboardingPopupProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleAccept = () => {
    if (acceptedTerms) {
      localStorage.setItem("onboardingAccepted", "true");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Welcome to the AI Capital!</h2>
        </div>
        <div className="p-4">
          <p className="mb-4">Here&apos;s how it works:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pitch token ideas to the AI portfolio manager</li>
            <li>Earn points and climb the leaderboard</li>
            <li>Learn about crypto markets in a risk-free environment</li>
          </ul>
        </div>
        <div className="flex items-center space-x-2 p-4 border-t">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={e => setAcceptedTerms(e.target.checked)}
            className="w-6 h-6 cursor-pointer"
          />
          <label htmlFor="terms" className="text-sm">
            I accept the{" "}
            <Link href="/terms" className="text-blue-500 hover:underline" target="_blank">
              Terms and Conditions
            </Link>
          </label>
        </div>
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={handleAccept}
            disabled={!acceptedTerms}
            className={`px-4 py-2 rounded ${
              acceptedTerms ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPopup;
