"use client"; // If using the Next.js App Router

import { useEffect, useState } from "react";
import Moralis from "moralis";

interface TransactionItem {
  hash: string;
  nonce: string;
  transaction_index: string;
  from_address: string;
  from_address_entity: string;
  from_address_entity_logo: string;
  from_address_label: string;
  to_address: string;
  to_address_entity: string;
  to_address_entity_logo: string;
  to_address_label: string;
  value: string;
  block_timestamp: string;
  block_number: string;
  native_transfers?: Array<{
    from_address: string;
    to_address: string;
    value: string;
    value_formatted: string;
    direction: string;
    token_symbol: string;
    token_logo: string;
  }>;
  // You can add the other properties like nft_transfers, erc20_transfer, etc.
}

export default function WalletEventsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
// optimism chain
  const chain = "0xA"; 
  const walletAddress = "0x2Ca3355E6e09e54bE4A70F44d6709DABA08fC786";
  // const walletAddress = "0xcB1C1FdE09f811B294172696404e88E658659905";
  useEffect(() => {
    const fetchWalletHistory = async () => {
      try {
        await Moralis.start({
          apiKey: process.env.MORALIS_API_KEY,
        });

        // Fetch the wallet history
        const response = await Moralis.EvmApi.wallets.getWalletHistory({
          chain,
          order: "DESC",
          address: walletAddress,
        });

        // Response is in response.raw
        const data = response.result;
        // 'data.result' is an array of transactions
        if (data) {
          setTransactions(data);
        }
      } catch (error) {
        console.error("Error fetching wallet history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Wallet Events</h1>

      {isLoading ? (
        <p className="text-center text-gray-500">Loading events...</p>
      ) : transactions.length === 0 ? (
        <p className="text-center text-gray-500">No transactions found.</p>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {transactions.map((tx) => (
            <TransactionCard key={tx.hash} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Renders a single transaction in a card layout */
function TransactionCard({ tx }: { tx: TransactionItem }) {
  // For better readability, parse the block timestamp
  const date = new Date(tx.block_timestamp);

  // Convert Wei to Ether if you want to display Ether value
  // Since "value" is in Wei, you might parse it with e.g. ethers.js if needed
  // or show a shortened version. For now, let's just show raw `value`.
  return (
    <div className="bg-white shadow-md rounded p-4">
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <span className="text-sm text-gray-400">Block #{tx.block_number}</span>
        <span className="text-sm text-gray-400">
          {date.toLocaleString("en-US")}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-1">
        <strong>Tx Hash:</strong> {truncateHash(tx.hash)}
      </p>

      {/* FROM */}
      <div className="flex items-center gap-2 mb-1">
        {/* If Moralis returns an entity logo, you can display it */}
        {tx.from_address_entity_logo && (
          <img
            src={tx.from_address_entity_logo}
            alt="from-logo"
            className="w-5 h-5"
          />
        )}
        <div>
          <span className="text-gray-600">From: </span>
          <span className="text-blue-600">{tx.from_address_entity || "User"}</span>
          <div className="text-xs text-gray-400">
            {truncateAddress(tx.from_address)} 
            {tx.from_address_label ? ` (${tx.from_address_label})` : ""}
          </div>
        </div>
      </div>

      {/* TO */}
      <div className="flex items-center gap-2 mb-3">
        {tx.to_address_entity_logo && (
          <img
            src={tx.to_address_entity_logo}
            alt="to-logo"
            className="w-5 h-5"
          />
        )}
        <div>
          <span className="text-gray-600">To: </span>
          <span className="text-blue-600">{tx.to_address_entity || "User"}</span>
          <div className="text-xs text-gray-400">
            {truncateAddress(tx.to_address)}
            {tx.to_address_label ? ` (${tx.to_address_label})` : ""}
          </div>
        </div>
      </div>

      {/* VALUE */}
      <p className="text-sm text-gray-800 mb-3">
        <strong>Value (Wei):</strong> {tx.value}
      </p>

      {/* Example: show native transfers if any exist */}
      {tx.native_transfers && tx.native_transfers.length > 0 && (
        <div className="bg-gray-50 p-2 rounded text-sm">
          <p className="font-medium mb-1">Native Transfers</p>
          {tx.native_transfers.map((nt, i) => (
            <div key={i} className="flex flex-col border-b last:border-none py-1">
              <div className="flex items-center gap-2">
                {nt.token_logo && (
                  <img
                    src={nt.token_logo}
                    alt={`${nt.token_symbol}-logo`}
                    className="w-4 h-4"
                  />
                )}
                <span>
                  {nt.direction === "outgoing" ? "Sent" : "Received"} {nt.value_formatted}{" "}
                  {nt.token_symbol}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                From {truncateAddress(nt.from_address)} to {truncateAddress(nt.to_address)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Helper to truncate hash/address for display */
function truncateHash(hash: string, length = 10) {
  if (!hash) return "";
  return hash.length > 2 * length
    ? hash.slice(0, length) + "..." + hash.slice(-length)
    : hash;
}

/** Address truncation utility */
function truncateAddress(address: string, length = 6) {
  if (!address) return "";
  return `${address.slice(0, length)}...${address.slice(-4)}`;
}
