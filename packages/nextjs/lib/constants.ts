import { Token } from "~~/types/token";

const chainId = Number(process.env.NEXT_PUBLIC_ZETA_CHAIN_ID);
if (!chainId) throw new Error("environment variable not set");

const isTestnet = chainId === 7001;

export const tokens: Token[] = [
  {
    // USDC.BASE
    address: isTestnet ? "0x0d4E00eba0FC6435E0301E35b03845bAdf2921b4" : "0x96152E6180E085FA57c7708e18AF8F05e37B479D",
    symbol: "USDC",
    decimals: 6,
  },
  {
    // BTC.BTC
    address: isTestnet ? "0x777915D031d1e8144c90D025C594b3b8Bf07a08d" : "0x13A0c5930C028511Dc02665E7285134B6d11A5f4",
    symbol: "BTC",
    decimals: 8,
  },
  {
    // ETH.ETH
    address: isTestnet ? "0x13A0c5930C028511Dc02665E7285134B6d11A5f4" : "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891",
    symbol: "ETH",
    decimals: 18,
  },
  {
    // BNB.BSC
    address: isTestnet ? "0x777915D031d1e8144c90D025C594b3b8Bf07a08d" : "0x48f80608B672DC30DC7e3dbBd0343c5F02C738Eb",
    symbol: "BNB",
    decimals: 18,
  },
  {
    // ULTI.BSC
    address: isTestnet ? "0x777915D031d1e8144c90D025C594b3b8Bf07a08d" : "0xD10932EB3616a937bd4a2652c87E9FeBbAce53e5",
    symbol: "ULTI",
    decimals: 18,
  },
  {
    // PEPE.ETH
    address: isTestnet ? "0xf63fC04B0e424787d2e66867B869E649b5Aa9308" : "0x236b0DE675cC8F46AE186897fCCeFe3370C9eDeD",
    symbol: "PEPE",
    decimals: 18,
  },
  {
    // SHIB.ETH
    address: isTestnet ? "0x777915D031d1e8144c90D025C594b3b8Bf07a08d" : "0x777915D031d1e8144c90D025C594b3b8Bf07a08d",
    symbol: "SHIB",
    decimals: 18,
  },
  {
    // DAI.ETH
    address: isTestnet ? "0x777915D031d1e8144c90D025C594b3b8Bf07a08d" : "0xcC683A782f4B30c138787CB5576a86AF66fdc31d",
    symbol: "DAI",
    decimals: 18,
  },
  {
    // POL.POLYGON
    address: isTestnet ? "0x777915D031d1e8144c90D025C594b3b8Bf07a08d" : "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501",
    symbol: "POL",
    decimals: 18,
  },
  {
    // SOL.SOL
    address: isTestnet ? "0x777915D031d1e8144c90D025C594b3b8Bf07a08d" : "0x4bC32034caCcc9B7e02536945eDbC286bACbA073",
    symbol: "SOL",
    decimals: 9,
  },
  { address: "0x0000000000000000000000000000000000000000", symbol: "ZETA", decimals: 18 },
];
