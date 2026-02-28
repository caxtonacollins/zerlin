'use client';

import { Button } from '@/components/atoms';
import { useWallet } from '@/hooks/useWallet';
import { useWalletStore } from '@/store/walletStore';

export function WalletConnect() {
  const { connect, disconnect, isConnecting } = useWallet();
  const { isConnected, stxAddress } = useWalletStore();

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (err) {
        console.error('Failed to connect:', err);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Button 
      onClick={handleClick} 
      variant="secondary"
      loading={isConnecting}
    >
      {isConnected && stxAddress ? formatAddress(stxAddress) : 'Connect Wallet'}
    </Button>
  );
}
