export type TransactionType =
  | 'transfer'
  | 'contract-call'
  | 'contract-deploy'
  | 'nft-mint'
  | 'swap';

export type CongestionLevel = 'low' | 'medium' | 'high';

export interface FeeAmount {
  stx: string;
  microStx: number;
  usd: string;
  btc: number;
}

export interface FeeBreakdown {
  baseFee: number;
  executionCost: number;
  dataSize: number;
}

export interface NetworkStatus {
  congestion: CongestionLevel;
  averageFee: number;
  recommendedBuffer: number;
}

export interface FeeEstimate {
  transactionType: TransactionType;
  estimatedFee: FeeAmount;
  breakdown: FeeBreakdown;
  networkStatus: NetworkStatus;
  timestamp: string;
  cached: boolean;
}
