// Network configuration
export const NETWORK = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
} as const;

// Contract addresses (will be populated from env)
export const CONTRACT_ADDRESSES = {
  FEE_ORACLE: process.env.NEXT_PUBLIC_FEE_ORACLE_ADDRESS || '',
  TX_TEMPLATES: process.env.NEXT_PUBLIC_TX_TEMPLATES_ADDRESS || '',
  SMART_ALERTS: process.env.NEXT_PUBLIC_SMART_ALERTS_ADDRESS || '',
} as const;

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
