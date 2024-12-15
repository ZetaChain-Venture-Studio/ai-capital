interface Token {
  token_address: string;
  symbol: string;
  name: string;
  logo: string;
  thumbnail: string;
  decimals: number;
  balance: string;
  possible_spam: boolean;
  verified_contract: boolean;
  balance_formatted: string;
  usd_price: number;
  usd_price_24hr_percent_change: number;
  usd_price_24hr_usd_change: number;
  usd_value: number;
  usd_value_24hr_usd_change: number;
  native_token: boolean;
  portfolio_percentage: number;
  // We add a custom property to track the chain this token is from
  chain?: string;
}

interface PortfolioResponse {
  result: Token[];
}

const CHAIN_IDS = [
  // "eth", // Ethereum mainnet
  // "sepolia", // Ethereum testnet
  "optimism", // Optimism mainnet
  // 'optimism-sepolia',// Optimism testnet
  // 'zksync-era',     // zkSync Era mainnet
  // 'zksync-era-sepolia', // zkSync Era testnet
];

export default async function PortfolioPage() {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    throw new Error("MORALIS_API_KEY environment variable not set.");
  }

  const walletAddress = "0xb13b7A60C88e1Ba2a204423aB420C60ACBA62c53"; // example address

  // Fetch tokens from all chains concurrently
  const promises = CHAIN_IDS.map(async chain => {
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/tokens?chain=${chain}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-Key": apiKey,
      },
      // For dynamic data, you can use 'no-store':
      // cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`Failed to fetch tokens for chain ${chain}:`, res.statusText);
      return [];
    }

    const data = (await res.json()) as PortfolioResponse;
    // Add chain property to each token
    return (data.result || []).map(token => ({ ...token, chain }));
  });

  // Wait for all fetches
  const results = await Promise.all(promises);
  // Flatten the array of arrays
  const tokens = results.flat();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AI Agent Portfolio</h1>

      {tokens.length === 0 ? (
        <p className="text-center text-gray-500">No tokens found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-3 px-4">Chain</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">USD Price</th>
                <th className="py-3 px-4">USD Value</th>
                <th className="py-3 px-4">Portfolio %</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(token => (
                <tr key={`${token.token_address}-${token.chain}`} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{token.chain}</td>
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div>
                      <div className="font-medium">{token.name}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{token.symbol}</td>
                  <td className="py-3 px-4">{token.balance_formatted}</td>
                  <td className="py-3 px-4">${token.usd_price}</td>
                  <td className="py-3 px-4">${token.usd_value}</td>
                  <td className="py-3 px-4">{token.portfolio_percentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
