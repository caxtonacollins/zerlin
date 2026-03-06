import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface NetworkStatusData {
  congestionLevel: 'low' | 'medium' | 'high';
  averageFeeRate: number;
  mempoolSize: number;
  blockHeight: number;
}

export function useNetworkStatus(autoRefresh = true, interval = 30000) {
  const [status, setStatus] = useState<NetworkStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getNetworkStatus();
      setStatus(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch network status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    if (autoRefresh) {
      const intervalId = setInterval(fetchStatus, interval);
      return () => clearInterval(intervalId);
    }
  }, [fetchStatus, autoRefresh, interval]);

  return {
    status,
    isLoading,
    error,
    refresh: fetchStatus,
  };
}
