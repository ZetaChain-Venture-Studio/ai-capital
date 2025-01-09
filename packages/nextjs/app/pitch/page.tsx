"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useReadContract, useWriteContract, useWalletClient } from "wagmi";
import { parseUnits, parseAbi, formatUnits } from "viem";

import BountyCard from "~~/components/Bounty";
import TreasuryCard from "~~/components/TreasuryPool";
import Chat from "~~/components/pitch/Chat";
import MyScore from "~~/components/MyScore";
import { TransactionFailureModal, TransactionSuccessModal } from "../../components/ResultModal";
import AllocationInput from "../../components/pitch/AllocationInput";
import PitchTextarea from "../../components/pitch/PitchTextarea";
import TokenSelect from "../../components/pitch/TokenSelect";
import TradeTypeSelect from "../../components/pitch/TradeTypeSelect";

import { validateAllocation } from "../../lib/utils";
import { analyzePitch } from "../actions/agents";

import Lucy from "../../public/assets/lucy.webp";
import ABI from "../../zeta-contracts/abi.json";

/* -------------------------------------------------------------------------- */
/*                               Constants & ABIs                             */
/* -------------------------------------------------------------------------- */

const erc20ABI = parseAbi([
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
]);

const USDC_ADDRESS = "0x0d4E00eba0FC6435E0301E35b03845bAdf2921b4";
const PAY_GAME_CONTRACT = "0x2dEcadD1A99cDf1daD617F18c41e9c4690F9F920";
const USDC_PRICE = parseUnits("1", 6);

/* -------------------------------------------------------------------------- */
/*                              Types & Interfaces                            */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */

export default function Pitch() {
  /* ------------------------------ Local States ------------------------------ */
  const [formData, setFormData] = useState<FormData>({
    token: "",
    tradeType: "buy",
    allocation: "",
    pitch: "",
  });

  const [pitchStatus, setPitchStatus] = useState<"idle" | "success" | "error">("idle");
  const [pitchError, setPitchError] = useState<string>("");
  const [refetchFlag, setRefetchFlag] = useState(false);

  const [contractPrice, setContractPrice] = useState("0");
  const isPriceLoading = !contractPrice || contractPrice === "0";

  // Transaction details for success/failure modals
  const [txDetails, setTxDetails] = useState<{
    chain: string;
    amount: string;
    token: string;
    transactionHash: string;
  }>({ chain: "", amount: "", token: "", transactionHash: "" });

  // Transaction modals open/close
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);

  // Loading state for any transaction in progress (approve or payGame)
  const [isTxInProgress, setIsTxInProgress] = useState(false);

  /* ------------------------------- Wagmi Hooks ------------------------------ */
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient(); // Not currently used, but handy if needed

  /* --------------------------- Read USDC Allowance -------------------------- */
  const { data: allowanceData = 0n } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20ABI,
    functionName: "allowance",
    args: address ? [address, PAY_GAME_CONTRACT] : undefined,
  });
  const isApprovalNeeded = allowanceData < USDC_PRICE;

  /* ------------------------ Write Contracts (approve) ----------------------- */
  const {
    writeContract: writeApprove,
    isError: isApproveError,
    error: approveError,
    data: approveTxData,
  } = useWriteContract();

  /* ------------------------- Write Contracts (payGame) ---------------------- */
  const {
    writeContract: writePayGame,
    isError: isPayGameError,
    error: payGameError,
    data: payGameTxData,
  } = useWriteContract();

  /* ---------------------------- Read USDC Price ----------------------------- */
  const {
    data: contractPriceData = 0n,
    refetch: refetchContractPrice,
  } = useReadContract({
    address: PAY_GAME_CONTRACT,
    abi: ABI,
    functionName: "price",
  });

  /* ------------------------------ useEffects ------------------------------ */

  // On mount or on contractPriceData update
  useEffect(() => {
    if (contractPriceData) {
      const formattedPrice = formatUnits(BigInt(contractPriceData.toString()), 6);
      setContractPrice(formattedPrice);
    }
  }, [contractPriceData]);

  // Approve transaction response
  useEffect(() => {
    if (approveTxData) {
      console.log("✅ USDC Approve transaction response:", approveTxData);
    }
  }, [approveTxData]);

  // payGame transaction response
  useEffect(() => {
    if (payGameTxData) {
      console.log("✅ payGame transaction response:", payGameTxData);

      // Update dynamic transaction details
      setTxDetails({
        chain: "ZetaChain",
        amount: contractPrice,
        token: "USDC",
        transactionHash: payGameTxData.toString(),
      });

      // Trigger success modal
      setPitchStatus("success");
      setIsSuccessModalOpen(true);
      refetchContractPrice();
    }
  }, [payGameTxData, contractPrice, refetchContractPrice]);

  // Approve error
  useEffect(() => {
    if (isApproveError) {
      console.error("Approve error:", approveError);
      setPitchStatus("error");
      setPitchError("Error: USDC approve transaction failed");
      setIsFailureModalOpen(true);
    }
  }, [isApproveError, approveError]);

  // payGame error
  useEffect(() => {
    if (isPayGameError) {
      console.error("payGame error:", payGameError);
      setPitchStatus("error");
      setPitchError("Error: payGame transaction failed");
      setTxDetails((prev) => ({
        ...prev,
        transactionHash: payGameTxData ? payGameTxData : "0x",
      }));
      setIsFailureModalOpen(true);
    }
  }, [isPayGameError, payGameError, payGameTxData]);

  // If either transaction finishes (success or error), stop loading spinner
  useEffect(() => {
    if (payGameTxData || isApproveError || isPayGameError) {
      setIsTxInProgress(false);
    }
  }, [payGameTxData, isApproveError, isPayGameError]);

  /* -------------------------------------------------------------------------- */
  /*                                Helper Methods                               */
  /* -------------------------------------------------------------------------- */

  const isValidPitch = () => {
    // Pitch length
    if (formData.pitch.length < 50) {
      setPitchStatus("error");
      setPitchError("Please ensure your pitch is at least 50 characters.");
      return false;
    }
    if (formData.pitch.length > 400) {
      setPitchStatus("error");
      setPitchError("Please ensure your pitch is less than 400 characters.");
      return false;
    }

    // Allowed characters
    if (!/^[A-Za-z0-9\s.,!?;:'"()—\-]*$/.test(formData.pitch)) {
      setPitchStatus("error");
      setPitchError("No special characters allowed in the pitch.");
      return false;
    }

    // Allocation
    const allocationValidation = validateAllocation(formData.allocation);
    if (!allocationValidation.isValid) {
      setPitchStatus("error");
      setPitchError(allocationValidation.message || "Invalid allocation");
      return false;
    }

    return true;
  };

  const executeTransaction = async () => {
    setIsTxInProgress(true);

    if (isApprovalNeeded) {
      // Approve needed
      if (!writeApprove) {
        setPitchError("Approve function not ready (missing config?).");
        setIsTxInProgress(false);
        return;
      }
      console.log("⏳ Calling USDC approve... Current allowance:", allowanceData.toString());
      writeApprove({
        address: USDC_ADDRESS,
        abi: erc20ABI,
        functionName: "approve",
        args: [
          PAY_GAME_CONTRACT,
          BigInt(
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          ),
        ],
      });
    } else {
      // payGame call
      if (!writePayGame) {
        setPitchError("payGame function not ready (missing config?).");
        setIsTxInProgress(false);
        return;
      }
      console.log("⏳ Calling payGame... Current allowance:", allowanceData.toString());
      writePayGame({
        address: PAY_GAME_CONTRACT,
        abi: ABI,
        functionName: "payGame",
        args: [address],
      });
    }
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
        address as `0x${string}`
      );
      if (response) {
        console.log("AI response:", response);
        setRefetchFlag((prev) => !prev);
      } else {
        console.error("AI API call error");
      }
    } catch (err) {
      console.error("Error during AI call:", err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             Event Handlers                                 */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    // Validate pitch & other input fields
    if (!isValidPitch()) return;

    // Check for wallet
    if (!address) {
      console.log("⛔ No wallet connected");
      setPitchError("Please connect your wallet first.");
      return;
    }

    // Clear previous errors
    setPitchStatus("idle");
    setPitchError("");

    // Execute transaction (approve or payGame)
    await executeTransaction();

    // Call AI after transaction is triggered
    console.log("⏳ Sending pitch to AI…");
    await sendMessage();
    console.log("✅ AI call finished");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setPitchStatus("idle");
    setPitchError("");
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Render                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="py-12 min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row gap-10 px-4 mx-auto sm:px-6 lg:px-8 justify-center max-lg:items-center">
        {/* Left panel: Bounty, Lucy's image, Treasury, and Score */}
        <div className="flex-shrink-0 flex flex-col items-center p-8 space-y-6">
          <BountyCard />
          <Image
            src={Lucy}
            alt="AI Capital"
            width={440}
            height={440}
            placeholder="blur"
            className="rounded"
          />
          <TreasuryCard />
          {address && <MyScore _refetchScoreFlag={refetchFlag} />}
        </div>

        {/* Right panel: Pitch submission and chat */}
        <div className="flex-grow max-w-3xl">
          <div className="p-8 bg-white rounded-lg shadow-sm">
            <h1 className="mb-8 text-3xl font-bold text-gray-900 text-center">
              Submit an Investment Pitch to Lucy
            </h1>

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
              {pitchStatus !== "idle" && (
                <div
                  className={`p-4 rounded-md ${
                    pitchStatus === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  <p>
                    {pitchStatus === "success"
                      ? "Pitch submitted successfully!"
                      : pitchError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isTxInProgress}
                className="px-6 py-3 w-full text-white bg-gray-900 rounded-md transition-colors hover:bg-gray-800"
              >
                {isTxInProgress ? (
                  <div className="mx-auto w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPriceLoading ? (
                  <div className="mx-auto w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Submit Pitch for ${contractPrice} USDC`
                )}
              </button>
            </form>
          </div>

          <Chat _refetchChatFlag={refetchFlag} />
        </div>
      </div>

      {/* Transaction Modals (Success / Failure) */}
      <TransactionSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        chain={txDetails.chain}
        amount={txDetails.amount}
        token={txDetails.token}
        transactionHash={txDetails.transactionHash}
      />
      <TransactionFailureModal
        isOpen={isFailureModalOpen}
        onClose={() => setIsFailureModalOpen(false)}
        reason="Transaction Failed"
        chain={txDetails.chain || "Ethereum"}
        transactionHash={txDetails.transactionHash}
        error={pitchError}
      />
    </div>
  );
}