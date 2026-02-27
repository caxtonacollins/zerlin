import { create } from 'zustand';
import type { WalletState } from '@/types/wallet';

export const useWalletStore = create<WalletState>(() => ({
  isConnected: false,
  connection: null,
  isConnecting: false,
  error: null,
}));
