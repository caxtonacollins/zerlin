import { Injectable, Logger } from '@nestjs/common';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import { fetchCallReadOnlyFunction, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';

@Injectable()
export class SmartAlertsService {
  private readonly logger = new Logger(SmartAlertsService.name);
  private readonly contractAddress: string;
  private readonly contractName = 'smart-alerts-v1';

  constructor(
    private readonly stacksService: StacksService,
    private readonly configService: ConfigService,
  ) {
    this.contractAddress = this.configService.get<string>('CONTRACT_ADDRESS_DEPLOYER', 'STY1XRRA93GJP9YMS2CTHB6M08M11BKPDVRM0191');
  }

  async getAlertStats() {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-alert-stats',
        functionArgs: [],
        network,
        senderAddress: this.contractAddress,
      });
      return cvToJSON(result).value;
    } catch (error) {
       this.logger.error('Failed to get alert stats', error);
       throw error;
    }
  }

  async getUserAlertCount(userAddress: string) {
      try {
          const network = this.stacksService.getNetwork();
          const result = await fetchCallReadOnlyFunction({
            contractAddress: this.contractAddress,
            contractName: this.contractName,
            functionName: 'get-user-alert-count',
            functionArgs: [standardPrincipalCV(userAddress)],
            network,
            senderAddress: this.contractAddress,
          });
          return cvToJSON(result).value;
      } catch (error) {
          this.logger.error(`Failed to get alert count for ${userAddress}`, error);
          throw error;
      }
  }

  async checkAlertTrigger(userAddress: string, alertId: number, currentFee: number): Promise<boolean> {
      try {
          const network = this.stacksService.getNetwork();
          const result = await fetchCallReadOnlyFunction({
            contractAddress: this.contractAddress,
            contractName: this.contractName,
            functionName: 'should-alert-trigger',
            functionArgs: [
                standardPrincipalCV(userAddress), 
                uintCV(alertId), 
                uintCV(currentFee)
            ],
            network,
            senderAddress: this.contractAddress,
          });
          // Returns (ok true/false) or error
          const json = cvToJSON(result);
          if (json.success) {
              return json.value.value === true;
          }
          return false;
      } catch (error) {
          this.logger.error(`Failed to check alert trigger ${alertId}`, error);
          throw error;
      }
  }
}
