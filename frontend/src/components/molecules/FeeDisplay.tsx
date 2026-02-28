import React from 'react';
import { Skeleton } from '@/components/atoms';

interface FeeDisplayProps {
  stx: string;
  usd: string;
  loading?: boolean;
}

export function FeeDisplay({ stx, usd, loading = false }: FeeDisplayProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-1">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
        {stx} STX
      </div>
      <div className="text-sm text-text-secondary">
        {usd}
      </div>
    </div>
  );
}
