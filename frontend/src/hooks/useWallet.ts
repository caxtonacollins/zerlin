import { useState, useCallback, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';

// Using 'any' type for Stacks Connect API responses which have dynamic structure
/* eslint-disable @typescript-eslint/no-explicit-any */

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setWalletData, disconnect: clearWalletData, isConnected: storeConnected } = useWalletStore();
  
  // Check if already authenticated on mount
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    const checkConnection = async () => {
      const { isConnected, request } = await import('@stacks/connect');
      
      if (isConnected() && !storeConnected) {
        try {
          const accounts = await request('stx_getAccounts') as any;
          if (accounts?.addresses?.[0]) {
            const account = accounts.addresses[0];
            setWalletData({
              stxAddress: account.address,
              btcAddress: account.address, // Use STX address as fallback
              publicKey: account.publicKey || '',
            });
          }
        } catch {
          // Silently fail if wallet restoration is not available
        }
      }
    };
    checkConnection();
  }, [storeConnected, setWalletData]);
  
  const connect = useCallback(async () => {
    // Guard against SSR
    if (typeof window === 'undefined') return;
    
    try {
      setIsConnecting(true);
      setError(null);
      
      const { connect: stacksConnect, isConnected, request } = await import('@stacks/connect');
      
      if (isConnected()) {
        return;
      }
      
      const response = await stacksConnect({
        appDetails: {
          name: 'Zerlin',
          icon: `${window.location.origin}/zerlin.png`,
        },
      } as any);
      
      if ((response as any)?.addresses) {
        const stxAddress = (response as any).addresses.stx?.[0]?.address || '';
        const btcAddress = (response as any).addresses.btc?.[0]?.address || '';
        
        // Get full account details
        const accounts = await request('stx_getAccounts') as any;
        const account = accounts?.addresses?.[0];
        
        setWalletData({
          stxAddress,
          btcAddress,
          publicKey: account?.publicKey || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [setWalletData]);
  
  const disconnect = useCallback(async () => {
    // Guard against SSR
    if (typeof window === 'undefined') return;
    
    const { disconnect: stacksDisconnect } = await import('@stacks/connect');
    stacksDisconnect();
    clearWalletData();
  }, [clearWalletData]);
  
  return {
    connect,
    disconnect,
    isConnecting,
    error,
  };
}
