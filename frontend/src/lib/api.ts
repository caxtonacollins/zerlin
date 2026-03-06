import { API_BASE_URL } from './constants';
import type { FeeEstimate } from '@/types/fee';

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async estimateFee(params: {
    type: string;
    payload?: Record<string, unknown>;
  }): Promise<FeeEstimate> {
    const response = await fetch(`${this.baseUrl}/api/estimate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to estimate fee' }));
      throw new Error(error.message || 'Failed to estimate fee');
    }
    
    return response.json();
  }
  
  async getNetworkStatus() {
    const response = await fetch(`${this.baseUrl}/api/network`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch network status' }));
      throw new Error(error.message || 'Failed to fetch network status');
    }
    
    return response.json();
  }
  
  async getFeeHistory(days: number = 7) {
    const response = await fetch(`${this.baseUrl}/api/history?days=${days}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch fee history' }));
      throw new Error(error.message || 'Failed to fetch fee history');
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
