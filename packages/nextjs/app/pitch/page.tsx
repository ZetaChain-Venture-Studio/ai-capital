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
import { parseUnits, parseAbi } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useWalletClient } from "wagmi";
import BountyCard from "~~/components/Bounty";
import MyScore from "~~/components/MyScore";
import TreasuryCard from "~~/components/TreasuryPool";
import Chat from "~~/components/pitch/Chat";
import MyScore from "~~/components/MyScore";
import ABI from "~~/zeta-contracts/abi.json";

// Minimal ERC20 ABI with `allowance` & `approve`
const erc20ABI = parseAbi([
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
]);

// Addresses & price
const USDC_ADDRESS = "0x0d4E00eba0FC6435E0301E35b03845bAdf2921b4"; // your USDC
const PAY_GAME_CONTRACT = "0x2dEcadD1A99cDf1daD617F18c41e9c4690F9F920"; // your payGame
// If payGame costs 1 USDC (6 decimals) → 1e6:
const USDC_PRICE = parseUnits("1", 6);

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

  // Wagmi
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // State to show/hide success/failure modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);

  /**
   * 1) Read USDC allowance
   */
  const { data: allowanceData = 0n } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20ABI,
    functionName: "allowance",
    args: address ? [address, PAY_GAME_CONTRACT] : undefined,
  });
  const needApproval = allowanceData < USDC_PRICE;

  /**
   * 2) useWriteContract for approve
   */
  const {
    writeContract: writeApprove,
    isError: isApproveError,
    error: approveError,
    data: approveTxData,
  } = useWriteContract();

  /**
   * 3) useWriteContract for payGame
   */
  const {
    writeContract: writePayGame,
    isError: isPayGameError,
    error: payGameError,
    data: payGameTxData,
  } = useWriteContract();

  // Log the transaction “response” data
  useEffect(() => {
    if (approveTxData) {
      console.log("✅ USDC Approve transaction response:", approveTxData);
    }
  }, [approveTxData]);

  useEffect(() => {
    if (payGameTxData) {
      console.log("✅ payGame transaction response:", payGameTxData);
    }
  }, [payGameTxData]);

  // If either transaction fails, set error state:
  useEffect(() => {
    if (isApproveError) {
      console.error("Approve error:", approveError);
      setStatus("error");
      setErrorMessage("Error: USDC approve transaction failed");
    }
  }, [isApproveError, approveError]);

  useEffect(() => {
    if (isPayGameError) {
      console.error("payGame error:", payGameError);
      setStatus("error");
      setErrorMessage("Error: payGame transaction failed");
    }
  }, [isPayGameError, payGameError]);

  // Single form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted:", formData);
    console.log("Pitch length:", formData.pitch.length);

    // 1) Validate pitch
    if (formData.pitch.length < 50) {
      console.log("⛔ Pitch is too short:", formData.pitch.length);
      setStatus("error");
      setErrorMessage("Please ensure your pitch is at least 50 characters.");
      return;
    }
    if (formData.pitch.length > 400) {
      console.log("⛔ Pitch is too long:", formData.pitch.length);
      setStatus("error");
      setErrorMessage("Please ensure your pitch is less than 400 characters.");
      return;
    }

    // 2) Check for special characters
    if (!/^[A-Za-z0-9\s.,!?;:'"()—\-]*$/.test(formData.pitch)) {
      console.log("⛔ Pitch has special characters not allowed.");
      setStatus("error");
      setErrorMessage("No special characters allowed in the pitch.");
      return;
    }

    // 3) Validate allocation
    const allocationValidation = validateAllocation(formData.allocation);
    if (!allocationValidation.isValid) {
      console.log("⛔ Invalid allocation:", allocationValidation.message);
      setStatus("error");
      setErrorMessage(allocationValidation.message || "Invalid allocation");
      return;
    }

    // 4) Check wallet
    if (!address) {
      console.log("⛔ No wallet connected");
      setErrorMessage("Please connect your wallet first.");
      return;
    }

    // Passed all validations:
    setStatus("idle");
    setErrorMessage("");

    // 5) Check allowance & call write functions
    if (needApproval) {
      if (!writeApprove) {
        console.log("⛔ Approve function not ready");
        setErrorMessage("Approve function not ready (missing config?).");
        return;
      }
      console.log("⏳ Calling USDC approve... Current allowance:", allowanceData.toString());
      writeApprove({
        address: USDC_ADDRESS,
        abi: erc20ABI,
        functionName: "approve",
        args: [PAY_GAME_CONTRACT, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
      });
    } else {
      if (!writePayGame) {
        console.log("⛔ payGame function not ready");
        setErrorMessage("payGame function not ready (missing config?).");
        return;
      }
      console.log("⏳ Calling payGame... Current allowance:", allowanceData.toString());
      writePayGame({
        address: PAY_GAME_CONTRACT,
        abi: ABI,
        functionName: "payGame",
        args: [address],
      });
      setStatus("success");
    }

    // 6) AI call after we trigger the transaction
    console.log("⏳ Sending pitch to AI…");
    await sendMessage();
    console.log("✅ AI call finished");
  };

  const sendMessage = async () => {
    if (!address) {
      console.log("⛔ No wallet, skipping AI call");
      return;
    }

    try {
      const response = await analyzePitch(
        formData.pitch,
        formData.token,
        formData.tradeType,
        formData.allocation,
        address as `0x${string}`,
      );
      if (response) {
        console.log("AI response:", response);
        setRefetchData(!refetchData);
      } else {
        console.error("AI API call error");
      }
    } catch (err) {
      console.error("Error during AI call:", err);
    }
  };

  // Standard handleChange
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStatus("idle");
    setErrorMessage("");
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

              {/* Error or success banner */}
              {status !== "idle" && (
                <div
                  className={`p-4 rounded-md ${
                    status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  <p>{status === "success" ? "Pitch submitted successfully!" : errorMessage}</p>
                </div>
              )}

              <button
                className="px-6 py-3 w-full text-white bg-gray-900 rounded-md transition-colors hover:bg-gray-800"
              >
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
