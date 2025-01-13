export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  balance?: string;
  price?: number;
  balanceFormatted?: number;
  valueUSD?: number;
}
