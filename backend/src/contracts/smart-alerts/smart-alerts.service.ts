import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import { fetchCallReadOnlyFunction, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { Alert } from '../../entities/alert.entity';
import { User } from '../../entities/user.entity';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class SmartAlertsService {
  private readonly logger = new Logger(SmartAlertsService.name);
  private readonly contractAddress: string;
  private readonly contractName = 'smart-alerts-v1';

  constructor(
    private readonly stacksService: StacksService,
    private readonly configService: ConfigService,
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.contractAddress = this.configService.get<string>('CONTRACT_ADDRESS_DEPLOYER', 'STY1XRRA93GJP9YMS2CTHB6M08M11BKPDVRM0191');
  }

  async createAlert(dto: CreateAlertDto) {
    let user = await this.userRepository.findOne({ where: { stacksAddress: dto.userAddress } });

    if (!user) {
      user = this.userRepository.create({
        stacksAddress: dto.userAddress,
        email: dto.email
      });
      await this.userRepository.save(user);
    } else if (dto.email && user.email !== dto.email) {
      user.email = dto.email;
      await this.userRepository.save(user);
    }

    const alert = this.alertRepository.create({
      user,
      targetFee: dto.targetFee,
      condition: dto.condition
    });

    return this.alertRepository.save(alert);
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
