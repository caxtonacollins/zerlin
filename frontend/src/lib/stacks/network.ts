import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

export function getStacksNetwork(network: 'mainnet' | 'testnet' = 'mainnet') {
  return network === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
}
