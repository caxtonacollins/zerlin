import { CONTRACT_ADDRESSES } from '../constants';

export const FEE_ORACLE_CONTRACT = {
  address: CONTRACT_ADDRESSES.FEE_ORACLE.split('.')[0] || '',
  name: CONTRACT_ADDRESSES.FEE_ORACLE.split('.')[1] || 'fee-oracle-v1',
};

export const TX_TEMPLATES_CONTRACT = {
  address: CONTRACT_ADDRESSES.TX_TEMPLATES.split('.')[0] || '',
  name: CONTRACT_ADDRESSES.TX_TEMPLATES.split('.')[1] || 'tx-templates-v1',
};

export const SMART_ALERTS_CONTRACT = {
  address: CONTRACT_ADDRESSES.SMART_ALERTS.split('.')[0] || '',
  name: CONTRACT_ADDRESSES.SMART_ALERTS.split('.')[1] || 'smart-alerts-v1',
};
