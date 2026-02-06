import { Injectable, Logger } from '@nestjs/common';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import { fetchCallReadOnlyFunction, cvToJSON, stringAsciiCV, uintCV } from '@stacks/transactions';

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
}
