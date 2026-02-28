import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
      storage: createJSONStorage(() => {
        // Only use localStorage on the client
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
