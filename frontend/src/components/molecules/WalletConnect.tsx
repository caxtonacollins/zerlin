'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms';

interface WalletConnectProps {
  onConnect: () => void;
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button 
      onClick={handleConnect} 
      variant="secondary"
      loading={isConnecting}
    >
      Connect Wallet
    </Button>
  );
}
