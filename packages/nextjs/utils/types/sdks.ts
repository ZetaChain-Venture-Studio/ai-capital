import { createThirdwebClient, defineChain, getContract } from "thirdweb";

export const client = createThirdwebClient({
    clientId: process.env.THIRDWEB_CLIENT_ID || "",
});
  
export const prizePoolSmartContract = getContract({
    client,
    chain: defineChain(Number(process.env.ZETA_CHAIN_ID)),
    address: process.env.NEXT_PUBLIC_AIC_ADDRESS || "",
});