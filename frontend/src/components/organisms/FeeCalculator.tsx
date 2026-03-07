import React, { useState } from 'react';
import { TransactionTypeSelector, FeeDisplay } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { useEstimate } from '@/hooks/useEstimate';
import type { TransactionType } from '@/types/fee';
import toast from 'react-hot-toast';

export function FeeCalculator() {
  const [transactionType, setTransactionType] = useState<TransactionType>('transfer');
  const { estimate, isLoading, error, calculateFee } = useEstimate();
  
  const handleCalculate = async () => {
    try {
      await calculateFee(transactionType);
      toast.success('Fee calculated successfully!');
    } catch {
      toast.error(error || 'Failed to calculate fee');
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Calculate Transaction Fee
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Transaction Type
          </label>
          <TransactionTypeSelector 
            value={transactionType}
            onChange={setTransactionType}
          />
        </div>
        
        <Button 
          onClick={handleCalculate}
          loading={isLoading}
          className="w-full"
        >
          Calculate Fee
        </Button>
        
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}
        
        {estimate && !isLoading && (
          <div className="mt-6 space-y-4">
            <FeeDisplay 
              stx={estimate.estimatedFee.stx} 
              usd={estimate.estimatedFee.usd} 
            />
            
            <div className="p-4 rounded-lg bg-bg-tertiary space-y-2">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Fee Breakdown</h3>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Base Fee:</span>
                <span className="text-text-primary">{estimate.breakdown.baseFee} microSTX</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Execution Cost:</span>
                <span className="text-text-primary">{estimate.breakdown.executionCost} microSTX</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Data Size:</span>
                <span className="text-text-primary">{estimate.breakdown.dataSize} bytes</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📊</span>
                <span className="text-sm font-semibold text-blue-400">Network Status</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Congestion:</span>
                <span className={`font-medium ${
                  estimate.networkStatus.congestion === 'low' ? 'text-green-400' :
                  estimate.networkStatus.congestion === 'medium' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {estimate.networkStatus.congestion.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-text-secondary">Recommended Buffer:</span>
                <span className="text-text-primary">{estimate.networkStatus.recommendedBuffer} microSTX</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
