import React, { useState } from 'react';
import { TransactionTypeSelector, FeeDisplay } from '@/components/molecules';
import { Button } from '@/components/atoms';
import type { TransactionType } from '@/types/fee';

export function FeeCalculator() {
  const [transactionType, setTransactionType] = useState<TransactionType>('transfer');
  const [isCalculating, setIsCalculating] = useState(false);
  
  const handleCalculate = async () => {
    setIsCalculating(true);
    // TODO: Implement fee calculation
    setTimeout(() => setIsCalculating(false), 1000);
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
          loading={isCalculating}
          className="w-full"
        >
          Calculate Fee
        </Button>
        
        {!isCalculating && (
          <div className="mt-6">
            <FeeDisplay stx="0.00395" usd="$0.0026" />
          </div>
        )}
      </div>
    </div>
  );
}
