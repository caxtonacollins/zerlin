import { Injectable, Logger } from '@nestjs/common';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV,
  tupleCV,
  listCV,
} from '@stacks/transactions';

@Injectable()
export class FeeOracleService {
  private readonly logger = new Logger(FeeOracleService.name);
  private readonly contractAddress: string;
  private readonly contractName = 'fee-oracle-v1';

  constructor(
    private readonly stacksService: StacksService,
    private readonly configService: ConfigService,
  ) {
    this.contractAddress = this.configService.get<string>(
      'CONTRACT_ADDRESS_DEPLOYER',
      'STY1XRRA93GJP9YMS2CTHB6M08M11BKPDVRM0191',
    );
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

  async checkSufficientBalance(
    userAddress: string,
    requiredFee: number,
  ): Promise<boolean> {
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
      this.logger.log(
        `Updating fee rate on contract to ${newFeeRate} (${congestion})`,
      );
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

  async initialize(initialFeeRate: number): Promise<string> {
    try {
      this.logger.log(`Initializing fee oracle with rate ${initialFeeRate}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'initialize',
        [uintCV(initialFeeRate)],
      );
      this.logger.log(`Oracle initialization transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to initialize fee oracle', error);
      throw error;
    }
  }

  async getLastUpdateBlock(): Promise<number> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-last-update-block',
        functionArgs: [],
        network,
        senderAddress: this.contractAddress,
      });
      return Number(cvToJSON(result).value);
    } catch (error) {
      this.logger.error('Failed to get last update block', error);
      throw error;
    }
  }

  async getTotalUpdates(): Promise<number> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-total-updates',
        functionArgs: [],
        network,
        senderAddress: this.contractAddress,
      });
      return Number(cvToJSON(result).value);
    } catch (error) {
      this.logger.error('Failed to get total updates', error);
      throw error;
    }
  }

  async isOracleInitialized(): Promise<boolean> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'is-oracle-initialized',
        functionArgs: [],
        network,
        senderAddress: this.contractAddress,
      });
      return cvToJSON(result).value === true;
    } catch (error) {
      this.logger.error('Failed to check oracle initialization', error);
      throw error;
    }
  }

  async isAuthorizedOracle(oracleAddress: string): Promise<boolean> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'is-authorized-oracle',
        functionArgs: [standardPrincipalCV(oracleAddress)],
        network,
        senderAddress: this.contractAddress,
      });
      return cvToJSON(result).value === true;
    } catch (error) {
      this.logger.error(
        `Failed to check authorization for ${oracleAddress}`,
        error,
      );
      throw error;
    }
  }

  async getFeeAtBlock(blockHeight: number) {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-fee-at-block',
        functionArgs: [uintCV(blockHeight)],
        network,
        senderAddress: this.contractAddress,
      });
      return cvToJSON(result).value;
    } catch (error) {
      this.logger.error(`Failed to get fee at block ${blockHeight}`, error);
      throw error;
    }
  }

  async getTransactionAverage(txType: string): Promise<number> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-transaction-average',
        functionArgs: [stringAsciiCV(txType)],
        network,
        senderAddress: this.contractAddress,
      });
      return Number(cvToJSON(result).value);
    } catch (error) {
      this.logger.error(
        `Failed to get transaction average for ${txType}`,
        error,
      );
      throw error;
    }
  }

  async getFeeSummary() {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-fee-summary',
        functionArgs: [],
        network,
        senderAddress: this.contractAddress,
      });
      return cvToJSON(result).value;
    } catch (error) {
      this.logger.error('Failed to get fee summary', error);
      throw error;
    }
  }

  async getRecommendedBuffer(): Promise<number> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-recommended-buffer',
        functionArgs: [],
        network,
        senderAddress: this.contractAddress,
      });
      return Number(cvToJSON(result).value);
    } catch (error) {
      this.logger.error('Failed to get recommended buffer', error);
      throw error;
    }
  }

  async estimateSwapFee(dexName: string): Promise<number> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'estimate-swap-fee',
        functionArgs: [stringAsciiCV(dexName)],
        network,
        senderAddress: this.contractAddress,
      });
      return Number(cvToJSON(result).value);
    } catch (error) {
      this.logger.error(`Failed to estimate swap fee for ${dexName}`, error);
      throw error;
    }
  }

  async updateTransactionAverage(
    txType: string,
    observedFee: number,
  ): Promise<string> {
    try {
      this.logger.log(
        `Updating transaction average for ${txType} with fee ${observedFee}`,
      );
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'update-transaction-average',
        [stringAsciiCV(txType), uintCV(observedFee)],
      );
      this.logger.log(`Transaction average update broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to update transaction average', error);
      throw error;
    }
  }

  async transferOwnership(newOwner: string): Promise<string> {
    try {
      this.logger.log(`Transferring ownership to ${newOwner}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'transfer-ownership',
        [standardPrincipalCV(newOwner)],
      );
      this.logger.log(`Ownership transfer transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to transfer ownership', error);
      throw error;
    }
  }

  async authorizeOracle(oracleAddress: string): Promise<string> {
    try {
      this.logger.log(`Authorizing oracle: ${oracleAddress}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'authorize-oracle',
        [standardPrincipalCV(oracleAddress)],
      );
      this.logger.log(`Oracle authorization transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to authorize oracle', error);
      throw error;
    }
  }

  async revokeOracle(oracleAddress: string): Promise<string> {
    try {
      this.logger.log(`Revoking oracle: ${oracleAddress}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'revoke-oracle',
        [standardPrincipalCV(oracleAddress)],
      );
      this.logger.log(`Oracle revocation transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to revoke oracle', error);
      throw error;
    }
  }

  async batchUpdateAverages(
    updates: Array<{ txType: string; observedFee: number }>,
  ): Promise<string> {
    try {
      this.logger.log(`Batch updating ${updates.length} transaction averages`);
      const updateTuples = updates.map((update) =>
        tupleCV({
          'tx-type': stringAsciiCV(update.txType),
          'observed-fee': uintCV(update.observedFee),
        }),
      );
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'batch-update-averages',
        [listCV(updateTuples)],
      );
      this.logger.log(`Batch update transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to batch update averages', error);
      throw error;
    }
  }
}
