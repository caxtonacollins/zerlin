import { useState, useCallback, useEffect } from 'react';
import { connect as stacksConnect, disconnect as stacksDisconnect, isConnected, request } from '@stacks/connect';
import { useWalletStore } from '@/store/walletStore';

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setWalletData, disconnect: clearWalletData, isConnected: storeConnected } = useWalletStore();
  
  // Check if already authenticated on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isConnected() && !storeConnected) {
        try {
          const accounts = await request('stx_getAccounts');
          if (accounts?.addresses?.[0]) {
            const account = accounts.addresses[0];
            setWalletData({
              stxAddress: account.address,
              btcAddress: account.address, // Use STX address as fallback
              publicKey: account.publicKey || '',
            });
          }
        } catch (err) {
          console.error('Failed to restore wallet connection:', err);
        }
      }
    };
    checkConnection();
  }, [storeConnected, setWalletData]);
  
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      if (isConnected()) {
        console.log('Already authenticated');
        return;
      }
      
      const response = await stacksConnect({
        appDetails: {
          name: 'Zerlin',
          icon: typeof window !== 'undefined' ? `${window.location.origin}/zerlin.png` : '/zerlin.png',
        },
      });
      
      if (response?.addresses) {
        const stxAddress = response.addresses.stx?.[0]?.address || '';
        const btcAddress = response.addresses.btc?.[0]?.address || '';
        
        // Get full account details
        const accounts = await request('stx_getAccounts');
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
  
  const disconnect = useCallback(() => {
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
