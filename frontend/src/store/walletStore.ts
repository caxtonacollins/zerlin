import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  isConnected: boolean;
  stxAddress: string | null;
  btcAddress: string | null;
  publicKey: string | null;
  setWalletData: (data: {
    stxAddress: string;
    btcAddress: string;
    publicKey: string;
  }) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isConnected: false,
      stxAddress: null,
      btcAddress: null,
      publicKey: null,
      setWalletData: (data) =>
        set({
          isConnected: true,
          stxAddress: data.stxAddress,
          btcAddress: data.btcAddress,
          publicKey: data.publicKey,
        }),
      disconnect: () =>
        set({
          isConnected: false,
          stxAddress: null,
          btcAddress: null,
          publicKey: null,
        }),
    }),
    {
      name: 'wallet-storage',
    }
  )
);
