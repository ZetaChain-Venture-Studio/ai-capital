"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { TransactionFailureModal, TransactionSuccessModal } from "../../components/ResultModal";
import PitchTextarea from "../../components/pitch/PitchTextarea";
import TokenSelect from "../../components/pitch/TokenSelect";
import ABI from "../../lib/abis/AIC.json";
import { validateAllocation } from "../../lib/utils";
import { formatUnits, parseAbi, parseUnits } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import BountyCard from "~~/components/Bounty";
import MyScore from "~~/components/MyScore";
import TreasuryCard from "~~/components/TreasuryPool";
import Chat from "~~/components/pitch/Chat";
import Lucy_Cross_Arms from "~~/public/assets/lucy_cross_arms.webp";
import Lucy_Glasses from "~~/public/assets/lucy_glasses.webp";
import Lucy_Thumbs_Up from "~~/public/assets/lucy_thumps_up.webp";
import Lucy_Mocks from "~~/public/assets/lucy_mocks.webp";

/* -------------------------------------------------------------------------- */
/*                               Constants & ABIs                             */
/* -------------------------------------------------------------------------- */

const erc20ABI = parseAbi([
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
]);

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "0x0d4E00eba0FC6435E0301E35b03845bAdf2921b4";
const PAY_GAME_CONTRACT = process.env.NEXT_PUBLIC_AIC_ADDRESS ?? "0x2dEcadD1A99cDf1daD617F18c41e9c4690F9F920";
const USDC_PRICE = parseUnits("1", 6);
const DEFAULT_APPROVE_PRICE = parseUnits("100", 6);
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_ZETA_CHAIN_ID);

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
  /* ------------------------------- Local State ------------------------------ */
  const [formData, setFormData] = useState<FormData>({
    token: "",
    tradeType: "buy",
    allocation: "1",
    pitch: "",
  });

  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [refetchFlag, setRefetchFlag] = useState(false);

  // Price read from smart contract
  const [contractPrice, setContractPrice] = useState("0");
  const isPriceLoading = contractPrice === "0";

  // Transaction details displayed in modals
  const [txDetails, setTxDetails] = useState<{
    chain: string;
    amount: string;
    token: string;
    transactionHash: string;
  }>({ chain: "", amount: "", token: "", transactionHash: "" });

  // Modals
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);

  // Loading spinner for any in-progress transaction
  const [isTxInProgress, setIsTxInProgress] = useState(false);

  const [hasPayGameTriggered, setHasPayGameTriggered] = useState(false);

  /* ------------------------------- Wagmi Hooks ------------------------------ */
  const { address } = useAccount();

  // Read USDC allowance
  const { data: allowanceData = 0n } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20ABI,
    functionName: "allowance",
    args: address ? [address, PAY_GAME_CONTRACT] : undefined,
  });
  const isApprovalNeeded = allowanceData < USDC_PRICE;

  // Approve contract
  const {
    writeContract: writeApprove,
    isError: isApproveError,
    error: approveError,
    data: approveTxData,
  } = useWriteContract();

  const { isSuccess: isApproveTxSuccess } = useWaitForTransactionReceipt({
    hash: approveTxData,
  });

  // Pay contract
  const {
    writeContract: writePayGame,
    isError: isPayGameError,
    error: payGameError,
    data: payGameTxData,
  } = useWriteContract();

  const { isSuccess: isPayGameTxSuccess } = useWaitForTransactionReceipt({
    hash: payGameTxData,
  });

  // Read USDC price from the contract
  const { data: contractPriceData = 0n, refetch: refetchContractPrice } = useReadContract({
    address: PAY_GAME_CONTRACT,
    abi: ABI,
    functionName: "price",
    chainId: CHAIN_ID || 7000,
  });

  /* -------------------------------------------------------------------------- */
  /*                                AI Messaging                                */
  /* -------------------------------------------------------------------------- */

  const sendMessage = useCallback(async () => {
    if (!address) {
      setSubmissionError("Please connect your wallet first.");
      console.log("⛔ No wallet, skipping AI call");
      return;
    }

    try {
      const dataToSend = {
        userAddress: address,
        userMessage: formData,
        swapATargetTokenAddress: USDC_ADDRESS,
        swapBTargetTokenAddress: formData.token,
      };

      console.log("Sending pitch to AI:", dataToSend);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("AI response:", data);
        setRefetchFlag(prev => !prev);
      } else {
        console.error("AI API call error response:", data);
      }
    } catch (err) {
      console.error("Error during AI call:", err);
    }
  }, [address, formData]);

  /* -------------------------------------------------------------------------- */
  /*                              Side Effects                                  */
  /* -------------------------------------------------------------------------- */

  // Update local price state
  useEffect(() => {
    if (contractPriceData) {
      const formattedPrice = formatUnits(BigInt(contractPriceData.toString()), 6);
      setContractPrice(formattedPrice);
    }
  }, [contractPriceData]);

  // If approve transaction is successful, automatically call payGame
  useEffect(() => {
    if (isApproveTxSuccess) {
      console.log("✅ USDC Approve completed. Calling payGame next...");
      console.log("⏳ Current allowance:", allowanceData.toString());
      writePayGame?.({
        address: PAY_GAME_CONTRACT,
        abi: ABI,
        functionName: "payGame",
        args: [address],
      });
    }
  }, [isApproveTxSuccess, address, allowanceData, writePayGame]);

  // On payGame success, make the AI call
  useEffect(() => {
    if (!isPayGameTxSuccess || hasPayGameTriggered) return;
    setHasPayGameTriggered(true);

    (async () => {
      try {
        console.log("⏳ Sending pitch to AI...");
        await sendMessage();
        console.log("✅ AI call finished");
      } catch (err) {
        console.error("AI call error:", err);
        setIsFailureModalOpen(true);
      } finally {
        setSubmissionStatus("success");
        refetchContractPrice();
        setIsTxInProgress(false);
      }
    })();
  }, [isPayGameTxSuccess, hasPayGameTriggered, refetchContractPrice, sendMessage]);

  // If we have a successful payGame transaction response, refetch the price
  useEffect(() => {
    if (payGameTxData) {
      console.log("✅ payGame transaction response:", payGameTxData);
      refetchContractPrice();
    }
  }, [payGameTxData, refetchContractPrice]);

  // Approve error
  useEffect(() => {
    if (isApproveError) {
      console.error("Approve error:", approveError);
      setSubmissionStatus("error");
      setSubmissionError("Error: USDC approve transaction failed");
      setIsFailureModalOpen(true);
      setIsTxInProgress(false);
    }
  }, [isApproveError, approveError]);

  // payGame error
  useEffect(() => {
    if (isPayGameError) {
      console.error("payGame error:", payGameError);
      setSubmissionStatus("error");
      setSubmissionError("Error: payGame transaction failed");
      setTxDetails(prev => ({
        ...prev,
        transactionHash: payGameTxData ? payGameTxData : "0x",
      }));
      setIsFailureModalOpen(true);
      setIsTxInProgress(false);
    }
  }, [isPayGameError, payGameError, payGameTxData]);

  // Trigger immediate refetch on mount
  useEffect(() => {
    refetchContractPrice();
  }, [refetchContractPrice]);

  /* -------------------------------------------------------------------------- */
  /*                                 Validation                                 */
  /* -------------------------------------------------------------------------- */

  const isValidPitch = (): boolean => {
    // Check if token is selected
    if (!formData.token) {
      setSubmissionStatus("error");
      setSubmissionError("Please select a token before submitting your pitch.");
      return false;
    }

    // Basic pitch length check
    if (formData.pitch.length < 50) {
      setSubmissionStatus("error");
      setSubmissionError("Please ensure your pitch is at least 50 characters.");
      return false;
    }
    if (formData.pitch.length > 400) {
      setSubmissionStatus("error");
      setSubmissionError("Please ensure your pitch is less than 400 characters.");
      return false;
    }

    // Allowed characters
    if (!/^[A-Za-z0-9\s.,!?;:'"()—\-]*$/.test(formData.pitch)) {
      setSubmissionStatus("error");
      setSubmissionError("No special characters allowed in the pitch.");
      return false;
    }

    // Allocation
    const allocationValidation = validateAllocation(formData.allocation);
    if (!allocationValidation.isValid) {
      setSubmissionStatus("error");
      setSubmissionError(allocationValidation.message || "Invalid allocation");
      return false;
    }

    return true;
  };

  /* -------------------------------------------------------------------------- */
  /*                             Transaction Logic                              */
  /* -------------------------------------------------------------------------- */

  const executeTransaction = async () => {
    setIsTxInProgress(true);

    try {
      if (isApprovalNeeded) {
        if (!writeApprove) {
          setSubmissionError("Approve function not configured properly.");
          setIsTxInProgress(false);
          return;
        }

        console.log("⏳ Calling USDC approve... Current allowance:", allowanceData.toString());
        writeApprove({
          address: USDC_ADDRESS,
          abi: erc20ABI,
          functionName: "approve",
          args: [PAY_GAME_CONTRACT, DEFAULT_APPROVE_PRICE],
        });
      } else {
        if (!writePayGame) {
          setSubmissionError("payGame function not configured properly.");
          setIsTxInProgress(false);
          return;
        }

        console.log("⏳ Calling payGame...");
        writePayGame({
          address: PAY_GAME_CONTRACT,
          abi: ABI,
          functionName: "payGame",
          args: [address],
        });
      }
    } catch (error) {
      console.error("executeTransaction error:", error);
      setIsTxInProgress(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                Event Handlers                              */
  /* -------------------------------------------------------------------------- */

  const handleSubmitPitch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    // Validate pitch & other input fields
    if (!isValidPitch()) return;

    // Check wallet connection
    if (!address) {
      console.log("⛔ No wallet connected");
      setSubmissionError("Please connect your wallet first.");
      return;
    }

    // Reset any previous error banners
    setSubmissionStatus("idle");
    setSubmissionError("");

    // Execute transaction (approve or payGame)
    await executeTransaction();
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmissionStatus("idle");
    setSubmissionError("");
  };

  /* ------------------------------- Helper Functions ------------------------------ */
  const getLucyImage = () => {
    if (isTxInProgress) return Lucy_Cross_Arms;
    if (submissionStatus === "success") return Lucy_Thumbs_Up;
    if (submissionError === "No special characters allowed in the pitch.") return Lucy_Mocks;
    return Lucy_Glasses;
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
            src={getLucyImage()}
            alt="AI Capital"
            width={440}
            height={460}
            placeholder="blur"
            className="rounded w-[440px] h-[440px] object-cover object-top"
          />
          <TreasuryCard _refetchScoreFlag={refetchFlag} />
          {address && <MyScore _refetchScoreFlag={refetchFlag} />}
        </div>

        {/* Right panel: Pitch submission and chat */}
        <div className="flex-grow max-w-3xl">
          <div className="p-8 bg-white rounded-lg shadow-sm">
            <h1 className="mb-8 text-3xl font-bold text-gray-900 text-center">Submit an Investment Pitch to Lucy</h1>

            <form onSubmit={handleSubmitPitch} className="space-y-6">
              <TokenSelect value={formData.token} onChange={handleInputChange} />

              <div className="flex flex-col md:flex-row gap-6">
                {/* <div className="flex-1">
                  <TradeTypeSelect value={formData.tradeType} onChange={handleInputChange} />
                </div> */}
                <div className="flex-1">
                  {/* <AllocationInput value={formData.allocation} onChange={handleInputChange} /> */}
                </div>
              </div>

              <PitchTextarea value={formData.pitch} onChange={handleInputChange} />

              {/* Error or success banner */}
              {submissionStatus !== "idle" && (
                <div
                  className={`p-4 rounded-md ${submissionStatus === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}
                >
                  <p>{submissionStatus === "success" ? "Pitch submitted successfully!" : submissionError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isTxInProgress}
                className="px-6 py-3 w-full text-white bg-gray-900 rounded-md transition-colors hover:bg-gray-800"
              >
                {isTxInProgress || isPriceLoading ? (
                  <div className="mx-auto w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Submit Pitch for ${contractPrice} USDC.BASE`
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
        chain={txDetails.chain || ""}
        transactionHash={txDetails.transactionHash}
        error={submissionError}
      />
    </div>
  );
}
