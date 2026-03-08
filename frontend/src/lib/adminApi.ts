import { API_BASE_URL } from './constants';
import type { SystemStats, UserWithStats, OracleStatus, AlertWithUser, HealthStatus } from '@/types/admin';

class AdminApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  // System Stats
  async getSystemStats(): Promise<SystemStats> {
    const response = await fetch(`${this.baseUrl}/api/admin/stats`);
    if (!response.ok) throw new Error('Failed to fetch system stats');
    return response.json();
  }
  
  // User Management
  async getUsers(page: number = 1, limit: number = 20): Promise<{ users: UserWithStats[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/api/admin/users?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }
  
  async getUserById(id: string): Promise<UserWithStats> {
    const response = await fetch(`${this.baseUrl}/api/admin/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  }
  
  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/admin/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
  }
  
  // Oracle Management
  async getOracleStatus(): Promise<OracleStatus> {
    const response = await fetch(`${this.baseUrl}/fee-oracle/status`);
    if (!response.ok) throw new Error('Failed to fetch oracle status');
    return response.json();
  }
  
  async updateFeeRate(feeRate: number, congestion: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/fee-oracle/update-rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feeRate, congestion }),
    });
    if (!response.ok) throw new Error('Failed to update fee rate');
  }
  
  async authorizeOracle(oracleAddress: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/fee-oracle/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oracleAddress }),
    });
    if (!response.ok) throw new Error('Failed to authorize oracle');
  }
  
  async revokeOracle(oracleAddress: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/fee-oracle/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oracleAddress }),
    });
    if (!response.ok) throw new Error('Failed to revoke oracle');
  }
  
  // Alert Management
  async getAllAlerts(page: number = 1, limit: number = 50): Promise<{ alerts: AlertWithUser[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/api/admin/alerts?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  }
  
  async toggleAlert(alertId: string, isActive: boolean): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/admin/alerts/${alertId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) throw new Error('Failed to toggle alert');
  }
  
  async deleteAlert(alertId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/admin/alerts/${alertId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete alert');
  }
  
  // Health Check
  async getHealth(): Promise<HealthStatus> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) throw new Error('Failed to fetch health status');
    return response.json();
  }
}

export const adminApi = new AdminApiClient(API_BASE_URL);
