import { create } from 'zustand';
import type { TransactionType, FeeEstimate } from '@/types/fee';

interface FeeState {
  currentFeeRate: number | null;
  transactionType: TransactionType;
  estimate: FeeEstimate | null;
  isLoading: boolean;
  setTransactionType: (type: TransactionType) => void;
  setEstimate: (estimate: FeeEstimate | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useFeeStore = create<FeeState>((set) => ({
  currentFeeRate: null,
  transactionType: 'transfer',
  estimate: null,
  isLoading: false,
  setTransactionType: (type) => set({ transactionType: type }),
  setEstimate: (estimate) => set({ estimate }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
