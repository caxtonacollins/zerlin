import React from 'react';
import { Button } from '@/components/atoms';

interface WalletConnectProps {
  onConnect: () => void;
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  return (
    <Button onClick={onConnect} variant="secondary">
      Connect Wallet
    </Button>
  );
}
