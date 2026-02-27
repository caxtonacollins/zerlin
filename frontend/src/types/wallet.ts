export type WalletType = 'xverse' | 'leather' | 'hiro';

export interface WalletConnection {
  address: string;
  balance: number;
  network: 'mainnet' | 'testnet';
  walletType: WalletType;
}

export interface WalletState {
  isConnected: boolean;
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
}
