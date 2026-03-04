import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { CreateAlertDto } from './create-alert.dto';

export class GetAlertDto {
  @ApiProperty({ description: 'User address', example: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' })
  @IsString()
  userAddress: string;

  @ApiProperty({ description: 'Alert ID', example: 1 })
  @IsNumber()
  alertId: number;
}

export class CanCreateAlertDto {
  @ApiProperty({ description: 'User address', example: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' })
  @IsString()
  userAddress: string;
}

export class AlertIdDto {
  @ApiProperty({ description: 'Alert ID', example: 1 })
  @IsNumber()
  alertId: number;
}

export class UpdateAlertThresholdDto {
  @ApiProperty({ description: 'Alert ID', example: 1 })
  @IsNumber()
  alertId: number;

  @ApiProperty({ description: 'New target fee in microSTX', example: 500 })
  @IsNumber()
  newTargetFee: number;
}

export class UpdateAlertTypeDto {
  @ApiProperty({ description: 'Alert ID', example: 1 })
  @IsNumber()
  alertId: number;

  @ApiProperty({ 
    description: 'New alert type', 
    enum: ['ABOVE', 'BELOW'],
    example: 'BELOW'
  })
  @IsEnum(['ABOVE', 'BELOW'])
  newType: 'ABOVE' | 'BELOW';
}

export class BatchAlertCheckDto {
  @ApiProperty({ 
    description: 'Array of alerts to check',
    type: [GetAlertDto]
  })
  @IsArray()
  alerts: Array<{ userAddress: string; alertId: number }>;

  @ApiProperty({ description: 'Current fee rate', example: 250 })
  @IsNumber()
  fee: number;
}

export class CreateAlertBatchDto {
  @ApiProperty({ 
    description: 'Array of alerts to create',
    type: [CreateAlertDto]
  })
  @IsArray()
  alerts: Array<{ targetFee: number; alertType: string; txType: string }>;
}

export class GetTriggerHistoryDto {
  @ApiProperty({ description: 'Alert ID', example: 1 })
  @IsNumber()
  alertId: number;

  @ApiProperty({ description: 'Trigger index', example: 0 })
  @IsNumber()
  triggerIndex: number;
}

export class TransferOwnershipDto {
  @ApiProperty({ description: 'New owner address', example: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' })
  @IsString()
  newOwner: string;
}

export class InitializeSmartAlertsDto {
  @ApiProperty({ description: 'Fee oracle contract address', example: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fee-oracle' })
  @IsString()
  oracleAddress: string;
}
