import React from 'react';
import { Badge } from '@/components/atoms';
import { formatStx } from '@/lib/formatters';

interface BalanceCheckProps {
  userBalance: number;
  requiredFee: number;
}

export function BalanceCheck({ userBalance, requiredFee }: BalanceCheckProps) {
  const isSufficient = userBalance >= requiredFee;
  const difference = Math.abs(userBalance - requiredFee);
  
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary">
      <div className="flex flex-col">
        <span className="text-sm text-text-secondary">Your Balance</span>
        <span className="text-lg font-semibold text-text-primary">
          {formatStx(userBalance)} STX
        </span>
      </div>
      
      <div className="flex flex-col items-end">
        {isSufficient ? (
          <>
            <Badge variant="success">Sufficient</Badge>
            <span className="text-xs text-text-tertiary mt-1">
              +{formatStx(difference)} STX extra
            </span>
          </>
        ) : (
          <>
            <Badge variant="error">Insufficient</Badge>
            <span className="text-xs text-text-tertiary mt-1">
              Need {formatStx(difference)} STX more
            </span>
          </>
        )}
      </div>
    </div>
  );
}
