import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface FeeHistoryPoint {
  timestamp: string;
  fee: number;
  congestion: string;
}

export function useFeeHistory(days: number = 7) {
  const [history, setHistory] = useState<FeeHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await apiClient.getFeeHistory(days);
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [days]);

  return { history, isLoading, error };
}
