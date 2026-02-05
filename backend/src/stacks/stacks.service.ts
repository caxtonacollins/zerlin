import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STACKS_MAINNET, STACKS_TESTNET, StacksNetwork } from '@stacks/network';

@Injectable()
export class StacksService {
  private readonly logger = new Logger(StacksService.name);
  private network: StacksNetwork;
  private apiUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(private configService: ConfigService) {
    const networkEnv = this.configService.get<string>('STACKS_NETWORK', 'mainnet');
    this.apiUrl = this.configService.get<string>(
      'STACKS_API_URL',
      // 'https://api.mainnet.hiro.so',
      'https://api.testnet.hiro.so'
    );
    this.timeout = this.configService.get<number>('STACKS_API_TIMEOUT', 5000);
    this.maxRetries = this.configService.get<number>('STACKS_API_MAX_RETRIES', 2);

    if (networkEnv === 'testnet') {
        this.network = STACKS_TESTNET;
    } else {
        this.network = STACKS_MAINNET;
    }
  }

  getNetwork() {
    return this.network;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options);
        return response;
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          this.logger.warn(`Fetch attempt ${attempt + 1} failed for ${url}, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  async getNetworkStatus() {
    try {
      const response = await this.fetchWithRetry(`${this.apiUrl}/v2/info`);
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
      const response = await this.fetchWithRetry(`${this.apiUrl}/extended/v1/tx/mempool/stats`);
      if (!response.ok) {
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
      const response = await this.fetchWithRetry(`${this.apiUrl}/v2/fees/transfer`);
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
      const feeRateRes = await this.fetchWithRetry(`${this.apiUrl}/v2/fees/transfer`);
      const feeRate = await feeRateRes.json();

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
       const feeRateRes = await this.fetchWithRetry(`${this.apiUrl}/v2/fees/transfer`);
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
