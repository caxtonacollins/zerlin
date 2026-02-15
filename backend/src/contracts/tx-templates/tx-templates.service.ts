import { Injectable, Logger } from '@nestjs/common';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import { fetchCallReadOnlyFunction, cvToJSON, stringAsciiCV, uintCV, standardPrincipalCV } from '@stacks/transactions';

@Injectable()
export class TxTemplatesService {
  private readonly logger = new Logger(TxTemplatesService.name);
  private readonly contractAddress: string;
  private readonly contractName = 'tx-templates-v1';

  constructor(
    private readonly stacksService: StacksService,
    private readonly configService: ConfigService,
  ) {
    this.contractAddress = this.configService.get<string>('CONTRACT_ADDRESS_DEPLOYER', 'STY1XRRA93GJP9YMS2CTHB6M08M11BKPDVRM0191');
  }

  async getTemplate(templateId: string) {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-template',
        functionArgs: [stringAsciiCV(templateId)],
        network,
        senderAddress: this.contractAddress,
      });
      return cvToJSON(result).value;
    } catch (error) {
       this.logger.error(`Failed to get template ${templateId}`, error);
       throw error;
    }
  }

  async getTemplateGas(templateId: string) {
      try {
          const network = this.stacksService.getNetwork();
          const result = await fetchCallReadOnlyFunction({
            contractAddress: this.contractAddress,
            contractName: this.contractName,
            functionName: 'get-template-gas',
            functionArgs: [stringAsciiCV(templateId)],
            network,
            senderAddress: this.contractAddress,
          });
          return cvToJSON(result).value;
      } catch (error) {
          this.logger.error(`Failed to get gas for ${templateId}`, error);
          throw error;
      }
  }

  async estimateFeeForTemplate(templateId: string, feeRate: number) {
      try {
          const network = this.stacksService.getNetwork();
          const result = await fetchCallReadOnlyFunction({
            contractAddress: this.contractAddress,
            contractName: this.contractName,
            functionName: 'estimate-fee-for-template',
            functionArgs: [stringAsciiCV(templateId), uintCV(feeRate)],
            network,
            senderAddress: this.contractAddress,
          });
          return cvToJSON(result).value;
      } catch (error) {
          this.logger.error(`Failed to estimate fee for ${templateId}`, error);
          throw error;
      }
  }

  async getFullEstimate(templateId: string) {
      try {
          const network = this.stacksService.getNetwork();
          const result = await fetchCallReadOnlyFunction({
            contractAddress: this.contractAddress,
            contractName: this.contractName,
            functionName: 'get-full-estimate',
            functionArgs: [stringAsciiCV(templateId)],
            network,
            senderAddress: this.contractAddress,
          });
          return cvToJSON(result).value;
      } catch (error) {
          this.logger.error(`Failed to get full estimate for ${templateId}`, error);
          throw error;
      }
  }

  async initializeTemplates(): Promise<string> {
    try {
      this.logger.log('Initializing transactions templates');
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'initialize-templates',
        [],
      );
      this.logger.log(`Templates initialization transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to initialize templates', error);
      throw error;
    }
  }

  async createTemplate(
    templateId: string,
    sizeBytes: number,
    gasUnits: number,
    description: string,
    category: string,
  ): Promise<string> {
    try {
      this.logger.log(`Creating template ${templateId}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'create-template',
        [
          stringAsciiCV(templateId),
          uintCV(sizeBytes),
          uintCV(gasUnits),
          stringAsciiCV(description),
          stringAsciiCV(category),
        ],
      );
      this.logger.log(`Template creation transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(`Failed to create template ${templateId}`, error);
      throw error;
    }
  }

  async updateTemplate(
    templateId: string,
    newSizeBytes: number,
    newGasUnits: number,
  ): Promise<string> {
    try {
      this.logger.log(`Updating template ${templateId}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'update-template',
        [
          stringAsciiCV(templateId),
          uintCV(newSizeBytes),
          uintCV(newGasUnits),
        ],
      );
      this.logger.log(`Template update transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(`Failed to update template ${templateId}`, error);
      throw error;
    }
  }

  async setFeeOracle(oracleAddress: string): Promise<string> {
    try {
      this.logger.log(`Setting fee oracle to ${oracleAddress} in TxTemplates contract`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'set-fee-oracle',
        [standardPrincipalCV(oracleAddress)],
      );
      this.logger.log(`Set fee oracle transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to set fee oracle in TxTemplates contract', error);
      throw error;
    }
  }

  async initialize(): Promise<string> {
    return this.initializeTemplates();
  }
}
