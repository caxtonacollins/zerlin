import React, { useState } from 'react';
import { Badge } from '@/components/atoms';
import { formatStx, formatUsd } from '@/lib/formatters';
import type { FeeBreakdown as FeeBreakdownType } from '@/types/fee';

interface FeeBreakdownProps {
  breakdown: FeeBreakdownType;
  totalStx: string;
  totalUsd: string;
}

export function FeeBreakdown({ breakdown, totalStx, totalUsd }: FeeBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="w-full p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-text-primary">Fee Breakdown</h3>
        <Badge variant="success">Verified On-Chain</Badge>
      </div>
      
      <div className="mb-6">
        <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {totalStx} STX
        </div>
        <div className="text-lg text-text-secondary mt-1">
          {totalUsd}
        </div>
      </div>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-sm text-secondary hover:text-secondary-dark transition-colors"
      >
        {isExpanded ? '▼' : '▶'} View detailed breakdown
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg bg-bg-primary">
            <span className="text-text-secondary">Base Transaction Fee</span>
            <span className="font-semibold text-text-primary">
              {formatStx(breakdown.baseFee)} STX
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 rounded-lg bg-bg-primary">
            <span className="text-text-secondary">Contract Execution Cost</span>
            <span className="font-semibold text-text-primary">
              {formatStx(breakdown.executionCost)} STX
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 rounded-lg bg-bg-primary">
            <span className="text-text-secondary">Data Size Overhead</span>
            <span className="font-semibold text-text-primary">
              {formatStx(breakdown.dataSize)} STX
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
