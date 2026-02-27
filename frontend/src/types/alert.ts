export type AlertType = 'below' | 'above';

export interface Alert {
  id: number;
  user: string;
  targetFee: number;
  alertType: AlertType;
  txType: string;
  isActive: boolean;
  createdAt: number;
  lastTriggered: number;
  triggerCount: number;
}

export interface CreateAlertInput {
  targetFee: number;
  alertType: AlertType;
  txType: string;
}

export interface AlertStats {
  totalCreated: number;
  totalTriggered: number;
  nextId: number;
}
