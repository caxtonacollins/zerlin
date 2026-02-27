import { useState, useCallback } from 'react';
import { showConnect } from '@stacks/connect';
import { useWalletStore } from '@/store/walletStore';

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      showConnect({
        appDetails: {
          name: 'Zerlin',
          icon: '/zerlin.png',
        },
        onFinish: (data) => {
          // TODO: Update wallet store with connection data
          console.log('Connected:', data);
        },
        onCancel: () => {
          setError('Connection cancelled');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);
  
  const disconnect = useCallback(() => {
    // TODO: Clear wallet store
    console.log('Disconnected');
  }, []);
  
  return {
    connect,
    disconnect,
    isConnecting,
    error,
  };
}
