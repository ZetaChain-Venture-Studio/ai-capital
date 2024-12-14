"use client";

import { useEffect, useState } from "react";
import AllocationInput from "../../components/pitch/AllocationInput";
import PitchTextarea from "../../components/pitch/PitchTextarea";
import TokenSelect from "../../components/pitch/TokenSelect";
import TradeTypeSelect from "../../components/pitch/TradeTypeSelect";
import { validateAllocation } from "../../lib/utils";
import { analyzePitch, getAllMessages } from "../actions/agents";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useWalletClient } from "wagmi";
import Chat from "~~/components/pitch/Chat";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

export interface FormData {
  token: string;
  tradeType: string;
  allocation: string;
  pitch: string;
}

export interface AIResponse extends FormData {
  aiResponseText: string;
  success: boolean;
}

export default function Pitch() {
  const [formData, setFormData] = useState<FormData>({
    token: "",
    tradeType: "",
    allocation: "",
    pitch: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [messages, setMessages] = useState<AIResponse[]>([]);
  const { address } = useAccount();

  const { data: walletClient } = useWalletClient();
  const { data: yourContract } = useScaffoldContract({
    contractName: "AIC",
    walletClient,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted:", formData, formData.pitch.length);

    // Validate pitch
    if (formData.pitch.length < 50) {
      setErrorMessage("Please ensure your pitch is at least 50 characters.");
      return;
    }

    // Validate allocation
    const allocationValidation = validateAllocation(formData.allocation);
    if (!allocationValidation.isValid) {
      setStatus("error");
      setErrorMessage(allocationValidation.message || "Invalid allocation");
      return;
    }

    try {
      const result = await walletClient?.sendTransaction({
        to: yourContract?.address,
        value: parseEther("0.0001"),
      });

      console.log("Transaction result:", result);
      await sendMessage();

      setStatus("success");
    } catch (e) {
      console.error("Error while paying for pitch:", e);
      setStatus("error");
      setErrorMessage("Error submitting pitch");
    }
    setErrorMessage("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStatus("idle");
    setErrorMessage("");
  };

  const sendMessage = async () => {
    const response = await analyzePitch(
      formData.pitch,
      formData.token,
      formData.tradeType,
      formData.allocation,
      address as `0x${string}`,
    );
    if (response) {
      const data = await response;
      console.log("AI response:", data);

      const aiResponse = response.aiResponseText;

      const newResponse: AIResponse = {
        ...formData,
        aiResponseText: aiResponse,
        success: response.success,
      };

      setMessages(prevMessages => [newResponse, ...prevMessages]);
    } else {
      console.error("AI API call error");
    }
  };

  const getGlobalChat = async () => {
    const messages = await getAllMessages();
    if (messages) {
      setMessages(messages);
    }
  };

  useEffect(() => {
    getGlobalChat();
  }, []);

  return (
    <div className="py-12 min-h-screen bg-gray-50">
      <div className="flex flex-col gap-10 px-4 mx-auto max-w-3xl sm:px-6 lg:px-8">
        <div className="p-8 bg-white rounded-lg shadow-sm">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Submit a Pitch</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TokenSelect value={formData.token} onChange={handleChange} />
            <TradeTypeSelect value={formData.tradeType} onChange={handleChange} />
            <AllocationInput value={formData.allocation} onChange={handleChange} />
            <PitchTextarea value={formData.pitch} onChange={handleChange} />

            {status !== "idle" && (
              <div
                className={`p-4 rounded-md ${
                  status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                <p>{status === "success" ? "Pitch submitted successfully!" : errorMessage}</p>
              </div>
            )}

            <button className="px-6 py-3 w-full text-white bg-gray-900 rounded-md transition-colors hover:bg-gray-800">
              Submit Pitch for 0.001 ETH
            </button>
          </form>
        </div>

        <Chat messages={messages} />
      </div>
    </div>
  );
}
