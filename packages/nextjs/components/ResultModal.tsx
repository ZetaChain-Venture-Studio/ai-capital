"use client";

// for Next.js app router or any client-side usage
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CopyToClipboard from "react-copy-to-clipboard";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import twitterIcon from "~~/public/assets/icons8-x.svg";

/** Basic modal props for open/close state. */
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

function ResultModal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  // Stop propagation so clicks inside modal won't close it
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-md shadow-md p-6 max-w-md w-full" onClick={stopPropagation}>
        {children}
      </div>
    </div>
  );
}

/** ---------------------------
 *   SUCCESS MODAL
 * --------------------------- */

/**
 * Props for the transaction success modal.
 * Example fields: token, amount, chain, transactionHash, blockNumber, gasUsed
 */
type TransactionSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  amount: string;
  chain: string;
  transactionHash?: string; // e.g., "0x1234..."
  blockNumber?: number; // e.g., 12345678
  gasUsed?: string; // e.g., "21000"
  discordLink?: string;
};

export function TransactionSuccessModal({
  isOpen,
  onClose,
  token,
  amount,
  chain,
  transactionHash,
  blockNumber,
  gasUsed,
  discordLink,
}: TransactionSuccessModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  // Hardcoded text for sharing on Twitter
  const shareText = `I convinced Ai agent to invest ${amount} into ${token} on ${chain}! #AiCapital #ZetaChain https://capital-ai-agent.vercel.app/ `;

  return (
    <ResultModal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        {/* Inline SVG for success icon */}
        <div className="mx-auto w-12 h-12 mb-2 text-green-500">
          <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 
                 8 0 000 16zm3.707-10.293
                 a1 1 0 00-1.414-1.414L9 
                 9.586 7.707 8.293a1 1 
                 0 00-1.414 1.414l2 2a1 
                 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-green-600">Transaction Successful</h2>

        <p className="mt-2 text-gray-700">
          You just swapped <strong>{amount}</strong> <strong>{token}</strong>.
        </p>
        <p className="mt-1 text-gray-700">
          On chain: <strong>{chain}</strong>
        </p>

        {transactionHash && (
          <div className="mt-2 flex items-center justify-center">
            <p className="text-sm text-gray-700 break-all mr-2">
              Tx Hash: <strong>{transactionHash}</strong>
            </p>
            <CopyToClipboard
              text={transactionHash}
              onCopy={() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }}
            >
              <button onClick={e => e.stopPropagation()} type="button">
                {copySuccess ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" aria-hidden="true" />
                ) : (
                  <DocumentDuplicateIcon className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </CopyToClipboard>
          </div>
        )}

        {blockNumber !== undefined && (
          <p className="mt-1 text-gray-700 text-sm">
            Block: <strong>{blockNumber}</strong>
          </p>
        )}

        {gasUsed && (
          <p className="mt-1 text-gray-700 text-sm">
            Gas Used: <strong>{gasUsed}</strong>
          </p>
        )}

        <p className="mt-2 text-gray-700">Your transaction has been confirmed and processed successfully.</p>

        {/* If a Discord link is provided, show it */}
        {discordLink && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Link href={discordLink} target="_blank">
              <span className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join Discord</span>
            </Link>
          </div>
        )}

        {/* Hardcoded "Share on Twitter" button */}
        <div className="flex justify-center items-center mt-4">
          <Link
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className=" text-black py-2 px-4 rounded flex items-center"
          >
            <span className="mr-2">Share on</span>
            {/* Hardcoded Twitter icon */}
            <Image src={twitterIcon} alt="Twitter" width={24} height={24} />
          </Link>
        </div>

        <button onClick={onClose} className="mt-6 px-4 py-2 bg-green-500 text-white rounded">
          Close
        </button>
      </div>
    </ResultModal>
  );
}

/** ---------------------------
 *   FAILURE MODAL
 * --------------------------- */

type TransactionFailureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reason: string; // e.g. "Insufficient balance"
  chain: string;
  transactionHash?: string;
  error?: string; // e.g. "revert: out of gas exception"
  blockNumber?: number;
  gasUsed?: string;

  discordLink?: string;
};

export function TransactionFailureModal({
  isOpen,
  onClose,
  reason,
  chain,
  transactionHash,
  error,
  blockNumber,
  gasUsed,
  discordLink,
}: TransactionFailureModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  return (
    <ResultModal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        {/* Inline SVG for failure icon */}
        <div className="mx-auto w-12 h-12 mb-2 text-red-500">
          <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 
                 8 0 000 16zm2.707-9.293
                 a1 1 0 00-1.414-1.414L10
                 8.586 8.707 7.293A1 1 0 
                 107.293 8.707l1.293 
                 1.293-1.293 1.293a1 1 
                 0 001.414 1.414L10 
                 11.414l1.293 1.293
                 a1 1 0 001.414-1.414
                 L11.414 10l1.293
                 -1.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-600">Transaction Failed</h2>

        <p className="mt-2 text-gray-700">
          Reason: <strong>{reason}</strong>
        </p>
        <p className="mt-1 text-gray-700">
          On chain: <strong>{chain}</strong>
        </p>

        {transactionHash && (
          <div className="mt-2 flex items-center justify-center">
            <p className="text-sm text-gray-700 break-all mr-2">
              Attempted TX Hash: <strong>{transactionHash}</strong>
            </p>
            <CopyToClipboard
              text={transactionHash}
              onCopy={() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }}
            >
              <button onClick={e => e.stopPropagation()} type="button">
                {copySuccess ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" aria-hidden="true" />
                ) : (
                  <DocumentDuplicateIcon className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </CopyToClipboard>
          </div>
        )}
        {blockNumber !== undefined && (
          <p className="mt-1 text-gray-700 text-sm">
            Block: <strong>{blockNumber}</strong>
          </p>
        )}
        {gasUsed && (
          <p className="mt-1 text-gray-700 text-sm">
            Gas Used: <strong>{gasUsed}</strong>
          </p>
        )}

        {error && <p className="mt-2 text-red-600 text-sm">Technical error: {error}</p>}

        <p className="mt-2 text-gray-700">Unfortunately, your transaction could not be processed.</p>
        <p className="text-gray-700">Please try again later.</p>

        {discordLink && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Link href={discordLink} target="_blank">
              <span className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join Discord</span>
            </Link>
          </div>
        )}

        <button onClick={onClose} className="mt-6 px-4 py-2 bg-red-500 text-white rounded">
          Close
        </button>
      </div>
    </ResultModal>
  );
}

/** ---------------------------
 *   PROMPT SUCCESS (optional)
 * --------------------------- */
type PromptSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  tokenFrom: string;
  tokenTo: string;
  amountFrom: number;
  amountTo: number;
  chain: string;
  estimatedTime: number;
  prizeCollected: number;
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-6 w-6 text-gray-500 mx-auto my-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function TokenLoader({ token }: { token: string }) {
  return (
    <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gray-200 animate-pulse mb-4">
      <span className="text-lg font-bold">{token}</span>
    </div>
  );
}

export function PromptSuccessModal({
  isOpen,
  onClose,
  userName,
  tokenFrom,
  tokenTo,
  amountFrom,
  amountTo,
  chain,
  estimatedTime,
  prizeCollected,
}: PromptSuccessModalProps) {
  const [status, setStatus] = useState<"waiting" | "success">("waiting");

  useEffect(() => {
    if (isOpen) {
      setStatus("waiting");
      const timer = setTimeout(() => {
        setStatus("success");
      }, estimatedTime * 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, estimatedTime]);

  return (
    <ResultModal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">
          {status === "waiting" ? "Rebalancing Portfolio" : "Rebalancing Complete"}
        </h2>
        <div className={`p-4 rounded-md ${status === "success" ? "bg-green-100" : "bg-gray-100"}`}>
          {status === "waiting" ? (
            <>
              <TokenLoader token={tokenFrom} />
              <p>
                Swapping {amountFrom} {tokenFrom} for {amountTo} {tokenTo}
              </p>
              <p className="mt-1">on {chain} chain</p>
              <p className="mt-1">Estimated wait time: {estimatedTime} seconds</p>
              <Spinner />
            </>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 mb-2 text-green-500">
                <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 
                       8 8 0 000 16zm3.707-10.293a1 
                       1 0 00-1.414-1.414L9 9.586 
                       7.707 8.293a1 1 0 00-1.414 
                       1.414l2 2a1 1 0 001.414 
                       0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p>
                Successfully swapped {amountFrom} {tokenFrom} for {amountTo} {tokenTo}
              </p>
              <p className="mt-1">on {chain} chain</p>
              <p className="mt-2">Congratulations, {userName}!</p>
              <p className="mt-1">Prize collected: ${prizeCollected}</p>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          disabled={status === "waiting"}
          className={`mt-4 px-4 py-2 rounded ${
            status === "waiting" ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-500 text-white"
          }`}
        >
          {status === "waiting" ? "Please wait..." : "Close"}
        </button>
      </div>
    </ResultModal>
  );
}
