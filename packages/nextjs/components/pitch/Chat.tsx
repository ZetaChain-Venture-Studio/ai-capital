"use client";

import { useState } from "react";
import { mockPortfolio } from "../portfolio/PortfolioTable";
import { AlertCircle, CheckCircle } from "lucide-react";
import { AIResponse, FormData } from "~~/app/pitch/page";

interface GlobalChatProps {
  messages: AIResponse[];
}

export default function Chat({ messages }: GlobalChatProps) {
  return (
    <div className="p-8 bg-white rounded-lg shadow-sm">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Chat</h1>
      {messages.map((message, index) => (
        <div key={index} className={`mb-4 p-2 rounded ${message.success ? "bg-green-100" : "bg-red-100"}`}>
          <p>
            <strong>User:</strong> {message.pitch}
          </p>
          <p className={message.success ? "text-green-600 font-semibold" : "text-red-600"}>
            <strong>AI:</strong> {message.aiResponseText}
          </p>
          <p className="text-sm text-gray-500">
            {message.tradeType} {message.allocation}% of {message.token}
          </p>
        </div>
      ))}
    </div>
  );
}
