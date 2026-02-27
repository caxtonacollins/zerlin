import { useEffect, useState } from 'react';
import { fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { getStacksNetwork } from '@/lib/stacks/network';
import { FEE_ORACLE_CONTRACT } from '@/lib/stacks/contracts';

export function useCurrentFee() {
  const [feeRate, setFeeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFee() {
      try {
        setIsLoading(true);
        setError(null);
        
        const network = getStacksNetwork();
        const result = await fetchCallReadOnlyFunction({
          contractAddress: FEE_ORACLE_CONTRACT.address,
          contractName: FEE_ORACLE_CONTRACT.name,
          functionName: 'get-current-fee-rate',
          functionArgs: [],
          network,
          senderAddress: FEE_ORACLE_CONTRACT.address,
        });
        
        const rate = Number(cvToJSON(result).value);
        setFeeRate(rate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch fee');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFee();
  }, []);

  return { feeRate, isLoading, error };
}
