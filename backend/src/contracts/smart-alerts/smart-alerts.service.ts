import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    this.contractAddress = this.configService.get<string>(
      'CONTRACT_ADDRESS_DEPLOYER',
      'STY1XRRA93GJP9YMS2CTHB6M08M11BKPDVRM0191',
    );
  }

  async createAlert(dto: CreateAlertDto) {
    let user = await this.userRepository.findOne({
      where: { stacksAddress: dto.userAddress },
    });

    if (!user) {
      user = this.userRepository.create({
        stacksAddress: dto.userAddress,
        email: dto.email,
      });
      await this.userRepository.save(user);
    } else if (dto.email && user.email !== dto.email) {
      user.email = dto.email;
      await this.userRepository.save(user);
    }

    const alert = this.alertRepository.create({
      user,
      targetFee: dto.targetFee,
      condition: dto.condition,
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

  async checkAlertTrigger(
    userAddress: string,
    alertId: number,
    currentFee: number,
  ): Promise<boolean> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'should-alert-trigger',
        functionArgs: [
          standardPrincipalCV(userAddress),
          uintCV(alertId),
          uintCV(currentFee),
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

  async markTriggered(
    userAddress: string,
    alertId: number,
    currentFee: number,
  ): Promise<string> {
    try {
      this.logger.log(
        `Marking alert ${alertId} as triggered for user ${userAddress}`,
      );
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'mark-triggered',
        [standardPrincipalCV(userAddress), uintCV(alertId), uintCV(currentFee)],
      );
      this.logger.log(`Alert trigger transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(`Failed to mark alert ${alertId} as triggered`, error);
      throw error;
    }
  }

  async setFeeOracle(oracleAddress: string): Promise<string> {
    try {
      this.logger.log(
        `Setting fee oracle to ${oracleAddress} in SmartAlerts contract`,
      );
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'set-fee-oracle',
        [standardPrincipalCV(oracleAddress)],
      );
      this.logger.log(`Set fee oracle transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(
        'Failed to set fee oracle in SmartAlerts contract',
        error,
      );
      throw error;
    }
  }

  async initialize(oracleAddress: string): Promise<string> {
    return this.setFeeOracle(oracleAddress);
  }

  async getAlert(userAddress: string, alertId: number) {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-alert',
        functionArgs: [standardPrincipalCV(userAddress), uintCV(alertId)],
        network,
        senderAddress: this.contractAddress,
      });
      return cvToJSON(result).value;
    } catch (error) {
      this.logger.error(
        `Failed to get alert ${alertId} for ${userAddress}`,
        error,
      );
      throw error;
    }
  }

  async canCreateAlert(userAddress: string): Promise<boolean> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'can-create-alert',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: this.contractAddress,
      });
      return cvToJSON(result).value === true;
    } catch (error) {
      this.logger.error(
        `Failed to check if ${userAddress} can create alert`,
        error,
      );
      throw error;
    }
  }

  async deactivateAlert(alertId: number): Promise<string> {
    try {
      this.logger.log(`Deactivating alert ${alertId}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'deactivate-alert',
        [uintCV(alertId)],
      );
      this.logger.log(`Alert deactivation transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(`Failed to deactivate alert ${alertId}`, error);
      throw error;
    }
  }

  async reactivateAlert(alertId: number): Promise<string> {
    try {
      this.logger.log(`Reactivating alert ${alertId}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'reactivate-alert',
        [uintCV(alertId)],
      );
      this.logger.log(`Alert reactivation transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(`Failed to reactivate alert ${alertId}`, error);
      throw error;
    }
  }

  async deleteAlert(alertId: number): Promise<string> {
    try {
      this.logger.log(`Deleting alert ${alertId}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'delete-alert',
        [uintCV(alertId)],
      );
      this.logger.log(`Alert deletion transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(`Failed to delete alert ${alertId}`, error);
      throw error;
    }
  }

  async updateAlertThreshold(
    alertId: number,
    newTargetFee: number,
  ): Promise<string> {
    try {
      this.logger.log(`Updating alert ${alertId} threshold to ${newTargetFee}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'update-alert-threshold',
        [uintCV(alertId), uintCV(newTargetFee)],
      );
      this.logger.log(
        `Alert threshold update transaction broadcasted: ${txid}`,
      );
      return txid;
    } catch (error) {
      this.logger.error(`Failed to update alert ${alertId} threshold`, error);
      throw error;
    }
  }

  async updateAlertType(alertId: number, newType: string): Promise<string> {
    try {
      this.logger.log(`Updating alert ${alertId} type to ${newType}`);
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'update-alert-type',
        [uintCV(alertId), stringAsciiCV(newType)],
      );
      this.logger.log(`Alert type update transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(`Failed to update alert ${alertId} type`, error);
      throw error;
    }
  }

  async batchCheckAlerts(
    alerts: Array<{ userAddress: string; alertId: number }>,
    fee: number,
  ) {
    try {
      this.logger.log(`Batch checking ${alerts.length} alerts with fee ${fee}`);
      const alertTuples = alerts.map((alert) =>
        tupleCV({
          user: standardPrincipalCV(alert.userAddress),
          'alert-id': uintCV(alert.alertId),
        }),
      );
      const result = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'batch-check-alerts',
        [listCV(alertTuples), uintCV(fee)],
      );
      this.logger.log(`Batch check transaction broadcasted: ${result}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to batch check alerts', error);
      throw error;
    }
  }

  async createAlertsBatch(
    alerts: Array<{ targetFee: number; alertType: string; txType: string }>,
  ): Promise<string> {
    try {
      this.logger.log(`Creating batch of ${alerts.length} alerts`);
      const alertTuples = alerts.map((alert) =>
        tupleCV({
          'target-fee': uintCV(alert.targetFee),
          'alert-type': stringAsciiCV(alert.alertType),
          'tx-type': stringAsciiCV(alert.txType),
        }),
      );
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'create-alerts-batch',
        [listCV(alertTuples)],
      );
      this.logger.log(`Batch alerts creation transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to create batch alerts', error);
      throw error;
    }
  }

  async isPaused(): Promise<boolean> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'is-paused',
        functionArgs: [],
        network,
        senderAddress: this.contractAddress,
      });
      return cvToJSON(result).value === true;
    } catch (error) {
      this.logger.error('Failed to check if contract is paused', error);
      throw error;
    }
  }

  async emergencyPause(): Promise<string> {
    try {
      this.logger.log('Emergency pausing contract');
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'emergency-pause',
        [],
      );
      this.logger.log(`Emergency pause transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to emergency pause contract', error);
      throw error;
    }
  }

  async emergencyResume(): Promise<string> {
    try {
      this.logger.log('Emergency resuming contract');
      const txid = await this.stacksService.broadcastContractCall(
        this.contractAddress,
        this.contractName,
        'emergency-resume',
        [],
      );
      this.logger.log(`Emergency resume transaction broadcasted: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Failed to emergency resume contract', error);
      throw error;
    }
  }

  async estimateCreationCost(): Promise<number> {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'estimate-creation-cost',
        functionArgs: [],
        network,
        senderAddress: this.contractAddress,
      });
      return Number(cvToJSON(result).value);
    } catch (error) {
      this.logger.error('Failed to get creation cost estimate', error);
      throw error;
    }
  }

  async getTriggerHistory(alertId: number, triggerIndex: number) {
    try {
      const network = this.stacksService.getNetwork();
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-trigger-history',
        functionArgs: [uintCV(alertId), uintCV(triggerIndex)],
        network,
        senderAddress: this.contractAddress,
      });
      return cvToJSON(result).value;
    } catch (error) {
      this.logger.error(
        `Failed to get trigger history for alert ${alertId}`,
        error,
      );
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
}
