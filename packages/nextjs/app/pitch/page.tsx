"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TransactionFailureModal, TransactionSuccessModal } from "../../components/ResultModal";
import AllocationInput from "../../components/pitch/AllocationInput";
import PitchTextarea from "../../components/pitch/PitchTextarea";
import TokenSelect from "../../components/pitch/TokenSelect";
import TradeTypeSelect from "../../components/pitch/TradeTypeSelect";
import { validateAllocation } from "../../lib/utils";
import Lucy from "../../public/assets/lucy.webp";
import { analyzePitch } from "../actions/agents";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useWalletClient } from "wagmi";
import BountyCard from "~~/components/Bounty";
import MyScore from "~~/components/MyScore";
import TreasuryCard from "~~/components/TreasuryPool";
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
    tradeType: "buy",
    allocation: "",
    pitch: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [refetchData, setRefetchData] = useState(false);
  const { address } = useAccount();

  const { data: walletClient } = useWalletClient();
  const { data: yourContract } = useScaffoldContract({
    contractName: "AIC2",
    walletClient,
  });

  // State to show/hide success/failure modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted:", formData, formData.pitch.length);

    // Validate pitch
    if (formData.pitch.length < 50) {
      setErrorMessage("Please ensure your pitch is at least 50 characters.");
      return;
    } else if (formData.pitch.length > 400) {
      setErrorMessage("Please ensure your pitch is less than 400 characters.");
      return;
    }

    // Check for special characters
    if (!/^[A-Za-z0-9\s.,!?]*$/.test(formData.pitch)) {
      setErrorMessage("No special characters allowed in the pitch.");
      return;
    }

    // Validate allocation
    const allocationValidation = validateAllocation(formData.allocation);
    if (!allocationValidation.isValid) {
      setStatus("error");
      setErrorMessage(allocationValidation.message || "Invalid allocation");
      return; // Not automatically showing failure modal here
    }

    try {
      // const result = await walletClient?.sendTransaction({
      //   to: yourContract?.address,
      //   value: parseEther("0.0001"),
      // });

      // console.log("Transaction result:", result);
      await sendMessage();

      setStatus("success");
      setErrorMessage("");
      // Not automatically showing success modal
    } catch (e) {
      console.error("Error while paying for pitch:", e);
      setStatus("error");
      setErrorMessage("Error submitting pitch");
      // Not automatically showing failure modal
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStatus("idle");
    setErrorMessage("");
  };

  const sendMessage = async () => {
    const dataSend = {
      userAddress: address,
      userMessage: formData,
      swapATargetTokenAddress: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // always USDT/USDC
      swapBTargetTokenAddress: formData.token,
    };

    console.log(dataSend);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataSend),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(data);
      setRefetchData(!refetchData);
    } else console.error("AI API call error");
  };

  return (
    <div className="py-12 min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row gap-10 px-4 mx-auto sm:px-6 lg:px-8 justify-center max-lg:items-center">
        <div className="flex-shrink-0 flex flex-col items-center p-8 space-y-6">
          <BountyCard />
          <Image src={Lucy} alt="AI Capital" width={440} height={440} placeholder="blur" className="rounded" />
          <TreasuryCard />
          {address && <MyScore _refetchScoreFlag={refetchData} />}
        </div>
        <div className="flex-grow max-w-3xl">
          <div className="p-8 bg-white rounded-lg shadow-sm">
            <h1 className="mb-8 text-3xl font-bold text-gray-900 text-center">Submit an Investment Pitch to Lucy</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TokenSelect value={formData.token} onChange={handleChange} />

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <TradeTypeSelect value={formData.tradeType} onChange={handleChange} />
                </div>
                <div className="flex-1">
                  <AllocationInput value={formData.allocation} onChange={handleChange} />
                </div>
              </div>

              <PitchTextarea value={formData.pitch} onChange={handleChange} />

              {status !== "idle" && (
                <div
                  className={`p-4 rounded-md ${status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}
                >
                  <p>{status === "success" ? "Pitch submitted successfully!" : errorMessage}</p>
                </div>
              )}

              <button className="px-6 py-3 w-full text-white bg-gray-900 rounded-md transition-colors hover:bg-gray-800">
                Submit Pitch for 1 USDC
              </button>

              {/* Debug buttons for showing success and failure modals */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setShowSuccessModal(true)}
                  className="btn-sm bg-green-500 text-white rounded-md px-4 py-2"
                >
                  Show Success Modal
                </button>
                <button
                  onClick={() => setShowFailureModal(true)}
                  className="btn-sm bg-red-500 text-white rounded-md px-4 py-2"
                >
                  Show Failure Modal
                </button>
              </div>
            </form>
          </div>

          <Chat _refetchChatFlag={refetchData} />
        </div>
      </div>

      {/* Our success/failure modals, controlled by local state */}
      <TransactionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        token="ETH"
        amount="0.001"
        chain="Ethereum"
        transactionHash="0x123abc..."
        blockNumber={16876234}
        gasUsed="21000"
      />

      <TransactionFailureModal
        isOpen={showFailureModal}
        onClose={() => setShowFailureModal(false)}
        reason="Insufficient funds"
        chain="Ethereum"
        transactionHash="0x123def..."
        blockNumber={16876235}
        gasUsed="20000"
        error="Reverted: out of gas exception"
      />
    </div>
  );
}
