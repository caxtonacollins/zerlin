export interface TransactionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  avgGasUnits: number;
  avgSizeBytes: number;
  lastUpdated: number;
  sampleCount: number;
}

export interface TransactionCategory {
  id: string;
  name: string;
  count: number;
}

export const TRANSACTION_CATEGORIES = [
  'transfer',
  'token',
  'nft',
  'dex',
  'sbtc',
  'defi',
  'multisig',
  'contract',
  'bns',
  'pox',
] as const;

export type TransactionCategoryType = typeof TRANSACTION_CATEGORIES[number];
