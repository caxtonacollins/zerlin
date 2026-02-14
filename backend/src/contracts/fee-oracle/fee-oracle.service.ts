import { Injectable, Logger } from '@nestjs/common';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import { fetchCallReadOnlyFunction, cvToJSON, standardPrincipalCV, uintCV, stringAsciiCV } from '@stacks/transactions';

@Injectable()
export class FeeOracleService {
  private readonly logger = new Logger(FeeOracleService.name);
  private readonly contractAddress: string;
  private readonly contractName = 'fee-oracle-v1';

  constructor(
    private readonly stacksService: StacksService,
    private readonly configService: ConfigService,
  ) {
    this.contractAddress = this.configService.get<string>('CONTRACT_ADDRESS_DEPLOYER', 'STY1XRRA93GJP9YMS2CTHB6M08M11BKPDVRM0191');
  }

  getContractFullName(): string {
    return `${this.contractAddress}.${this.contractName}`;
  }

  async getFeeRate(): Promise<number> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-current-fee-rate',
        functionArgs: [],
        network,
        senderAddress: this.contractAddress,
      });
      return Number(cvToJSON(result).value);
    } catch (error) {
      this.logger.error('Failed to get current fee rate', error);
      throw error;
    }
  }

  async estimateTransferFee(): Promise<number> {
    try {
        const network = this.stacksService.getNetwork();
        const result = await fetchCallReadOnlyFunction({
          contractAddress: this.contractAddress,
          contractName: this.contractName,
          functionName: 'estimate-transfer-fee',
          functionArgs: [],
          network,
          senderAddress: this.contractAddress,
        });
        return Number(cvToJSON(result).value);
    } catch (error) {
        this.logger.error('Failed to estimate transfer fee', error);
        throw error;
    }
  }

  async estimateContractCallFee(complexity: number): Promise<number> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'estimate-contract-call-fee',
        functionArgs: [uintCV(complexity)],
        network,
        senderAddress: this.contractAddress,
      });
      return Number(cvToJSON(result).value);
    } catch (error) {
      this.logger.error('Failed to estimate contract call fee', error);
      throw error;
    }
  }

  async estimateNftMintFee(): Promise<number> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'estimate-nft-mint-fee',
        functionArgs: [],
        network,
        senderAddress: this.contractAddress,
      });
      return Number(cvToJSON(result).value);
    } catch (error) {
      this.logger.error('Failed to estimate NFT mint fee', error);
      throw error;
    }
  }

  async checkSufficientBalance(userAddress: string, requiredFee: number): Promise<boolean> {
      try {
          const network = this.stacksService.getNetwork();
          const result = await fetchCallReadOnlyFunction({
            contractAddress: this.contractAddress,
            contractName: this.contractName,
            functionName: 'check-sufficient-balance',
            functionArgs: [standardPrincipalCV(userAddress), uintCV(requiredFee)],
            network,
            senderAddress: this.contractAddress,
          });
          return cvToJSON(result).value === true;
      } catch (error) {
          this.logger.error(`Failed to check balance for ${userAddress}`, error);
          throw error;
      }
  }

  async updateFeeRate(newFeeRate: number, congestion: string): Promise<string> {
    try {
      this.logger.log(`Updating fee rate on contract to ${newFeeRate} (${congestion})`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'update-fee-rate',
        [uintCV(newFeeRate), stringAsciiCV(congestion)],
      );
      this.logger.log(`Fee update transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to update fee rate on contract', error);
      throw error;
    }
  }
}
