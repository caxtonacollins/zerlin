import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StacksMainnet, StacksTestnet, StacksNetwork } from '@stacks/network';
import {
  TransactionVersion,
  estimateTransfer,
  estimateContractDeploy,
  estimateContractFunctionCall,
} from '@stacks/transactions';

@Injectable()
export class StacksService {
  private readonly logger = new Logger(StacksService.name);
  private network: StacksNetwork;
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    const networkEnv = this.configService.get<string>('STACKS_NETWORK', 'mainnet');
    this.apiUrl = this.configService.get<string>(
      'STACKS_API_URL',
      'https://api.mainnet.hiro.so',
    );

    if (networkEnv === 'testnet') {
      this.network = new StacksTestnet({ url: this.apiUrl });
    } else {
      this.network = new StacksMainnet({ url: this.apiUrl });
    }
  }

  getNetwork() {
    return this.network;
  }

  async getNetworkStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/v2/info`);
      if (!response.ok) {
        throw new Error(`Failed to fetch network info: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error('Error fetching network status', error);
      throw error;
    }
  }

  async getRecentMempoolStats() {
    try {
      // Using extended v2/mempool/stats if available or deriving from recent txs
      const response = await fetch(`${this.apiUrl}/extended/v1/tx/mempool/stats`);
       if (!response.ok) {
         // Fallback or specific handling
        return null;
      }
      return await response.json();
    } catch (error) {
      this.logger.warn('Error fetching mempool stats', error);
      return null;
    }
  }

  // Basic estimation wrapper using @stacks/transactions
  // Note: Accurate estimation often requires constructing the transaction payload
  // This is a simplified estimation based on byte size and current network fee rate
  async estimateTransferFee(amountMicroStx: bigint, recipient: string, memo?: string) {
    try {
        const response = await fetch(`${this.apiUrl}/v2/fees/transfer`);
        const data = await response.json();
        return data as number; 
    } catch (e) {
        this.logger.error('Failed to get transfer fee', e);
        throw e;
    }
  }

  async estimateContractCallFee(
    contractAddress: string,
    contractName: string,
    functionName: string,
    functionArgs: string[],
  ) {
    // Placeholder: Real implementation requires simulating the transaction
    // using @stacks/transactions read-only call to estimate execution cost
    // For MVP, we can fetch the current network fee rate and multiply by a standard
    // contract call size + buffer.
    try {
      // Fetch fee rate
      const feeRateRes = await fetch(`${this.apiUrl}/v2/fees/transfer`);
      const feeRate = await feeRateRes.json();
      
      // Heuristic: Contract calls are largely dependent on runtime execution.
      // A standard simple call might optionally use a fixed gas estimate for MVP display
      // equivalent to ~0.00something STX.
      // Ideally, we use: https://api.hiro.so/v2/contracts/call-read to simulate
      return {
        feeRate,
        estimatedCost: 3000, // microSTX dummy
      };
    } catch (error) {
       this.logger.error(`Error estimating contract call`, error);
       throw error;
    }
  }

  async estimateContractDeployFee(
    contractName: string,
    codeBody: string,
  ) {
     try {
       const feeRateRes = await fetch(`${this.apiUrl}/v2/fees/transfer`);
       const feeRate = await feeRateRes.json();
       return {
         feeRate,
         estimatedCost: 50000, // Higher default for deploy
       };
     } catch (error) {
       this.logger.error(`Error estimating contract deploy`, error);
       throw error;
     }
  }
}
