export interface SystemStats {
  totalUsers: number;
  totalAlerts: number;
  activeAlerts: number;
  totalEstimates: number;
  avgResponseTime: number;
  cacheHitRate: number;
}

export interface UserWithStats {
  id: string;
  stacksAddress: string;
  email: string | null;
  createdAt: string;
  alertCount: number;
  lastActive: string | null;
}

export interface OracleStatus {
  currentFeeRate: number;
  lastUpdate: string;
  authorizedOracles: string[];
  owner: string;
  isInitialized: boolean;
}

export interface AlertWithUser {
  id: string;
  userId: string;
  userAddress: string;
  targetFee: number;
  condition: 'ABOVE' | 'BELOW';
  isActive: boolean;
  createdAt: string;
  triggerCount?: number;
}

export interface TemplateInfo {
  name: string;
  gasEstimate: number;
  lastUpdated: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  database: boolean;
  redis: boolean;
  stacks: boolean;
  uptime: number;
}
