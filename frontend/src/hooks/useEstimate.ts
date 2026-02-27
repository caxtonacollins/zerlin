import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { FeeEstimate, TransactionType } from '@/types/fee';

export function useEstimate() {
  const [estimate, setEstimate] = useState<FeeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFee = useCallback(async (
    type: TransactionType,
    payload?: Record<string, any>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiClient.estimateFee({ type, payload });
      setEstimate(result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to estimate fee';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setEstimate(null);
    setError(null);
  }, []);

  return {
    estimate,
    isLoading,
    error,
    calculateFee,
    reset,
  };
}
