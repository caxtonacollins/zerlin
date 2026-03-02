'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/atoms';
import { useWallet } from '@/hooks/useWallet';
import { useWalletStore } from '@/store/walletStore';

export function WalletConnect() {
  const { connect, disconnect, isConnecting } = useWallet();
  const { isConnected, stxAddress } = useWalletStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (err) {
        // Error already handled by useWallet hook
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Prevent hydration mismatch by not rendering wallet state until mounted
  if (!mounted) {
    return (
      <Button 
        onClick={() => {}} 
        variant="secondary"
        disabled
      >
        Connect Wallet
      </Button>
    );
  }

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
