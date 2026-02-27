import React from 'react';
import { Badge } from '@/components/atoms';
import type { CongestionLevel } from '@/types/fee';

interface NetworkStatusProps {
  congestion: CongestionLevel;
}

export function NetworkStatus({ congestion }: NetworkStatusProps) {
  const congestionMap = {
    low: { variant: 'success' as const, label: 'Low Congestion' },
    medium: { variant: 'warning' as const, label: 'Medium Congestion' },
    high: { variant: 'error' as const, label: 'High Congestion' },
  };
  
  const { variant, label } = congestionMap[congestion];
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-text-secondary">Network:</span>
      <Badge variant={variant}>{label}</Badge>
    </div>
  );
}
