import React from 'react';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types/fee';

interface TransactionTypeSelectorProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

export function TransactionTypeSelector({ value, onChange }: TransactionTypeSelectorProps) {
  const baseStyles = 'w-full px-4 py-3 rounded-lg border border-bg-tertiary bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200';
  
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value as TransactionType)}
      className={cn(baseStyles)}
    >
      <option value="transfer">STX Transfer</option>
      <option value="contract-call">Contract Call</option>
      <option value="contract-deploy">Contract Deploy</option>
      <option value="nft-mint">NFT Mint</option>
      <option value="swap">Token Swap</option>
    </select>
  );
}
