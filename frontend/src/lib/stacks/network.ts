import { StacksMainnet, StacksTestnet } from '@stacks/network';

export function getStacksNetwork(network: 'mainnet' | 'testnet' = 'mainnet') {
  return network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
}
