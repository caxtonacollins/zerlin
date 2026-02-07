import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsIn } from 'class-validator';

export class EstimateFeeDto {
  @ApiProperty({
    description: 'Transaction type',
    example: 'transfer',
    enum: ['transfer', 'contract-call', 'contract-deploy', 'nft-mint', 'swap', 'sbtc-peg-in', 'sbtc-peg-out'],
    default: 'transfer',
  })
  @IsString()
  @IsIn(['transfer', 'contract-call', 'contract-deploy', 'nft-mint', 'swap', 'sbtc-peg-in', 'sbtc-peg-out'])
  type: string;

  @ApiProperty({
    description: 'Transaction payload (varies by type)',
    example: { amount: 1000000, recipient: 'SP2X0TZ59D5SZ8ACQ...' },
    required: false,
    default: { amount: 1000000, recipient: 'SP2X0TZ59D5SZ8ACQ...' },
  })
  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;

  @ApiProperty({
    description: 'Template ID for template-based estimation',
    example: 'stx-transfer',
    required: false,
    default: 'stx-transfer',
  })
  @IsOptional()
  @IsString()
  templateId?: string;
}

export class FeeBreakdownDto {
  @ApiProperty({ description: 'Base transaction fee in microSTX', example: 180 })
  baseFee: number;

  @ApiProperty({ description: 'Execution cost in microSTX', example: 0 })
  executionCost: number;

  @ApiProperty({ description: 'Data size in bytes', example: 180 })
  dataSize: number;
}

export class NetworkStatusDto {
  @ApiProperty({ description: 'Network congestion level', example: 'low', enum: ['low', 'medium', 'high'] })
  congestion: string;

  @ApiProperty({ description: 'Average fee rate in microSTX', example: 1 })
  averageFee: number;

  @ApiProperty({ description: 'Recommended buffer in microSTX', example: 1000 })
  recommendedBuffer: number;
}

export class EstimatedFeeDto {
  @ApiProperty({ description: 'Fee in STX', example: '0.00018' })
  stx: string;

  @ApiProperty({ description: 'Fee in USD', example: '0.0001' })
  usd: string;

  @ApiProperty({ description: 'Fee in microSTX', example: 180 })
  microStx: number;

  @ApiProperty({ description: 'Fee in BTC', example: 0.000000004 })
  btc: number;
}

export class FeeEstimateResponseDto {
  @ApiProperty({ description: 'Transaction type', example: 'transfer' })
  transactionType: string;

  @ApiProperty({ description: 'Estimated fee', type: EstimatedFeeDto })
  estimatedFee: EstimatedFeeDto;

  @ApiProperty({ description: 'Fee breakdown', type: FeeBreakdownDto })
  breakdown: FeeBreakdownDto;

  @ApiProperty({ description: 'Network status', type: NetworkStatusDto })
  networkStatus: NetworkStatusDto;

  @ApiProperty({ description: 'Timestamp', example: '2026-02-05T19:00:00.000Z' })
  timestamp?: Date;

  @ApiProperty({ description: 'Whether result was cached', example: false })
  cached?: boolean;
}

export class NetworkStatusResponseDto {
  @ApiProperty({ description: 'Congestion level', example: 'low' })
  congestionLevel: string;

  @ApiProperty({ description: 'Average fee rate', example: 1 })
  averageFeeRate: number;

  @ApiProperty({ description: 'Mempool size', example: 0 })
  mempoolSize: number;

  @ApiProperty({ description: 'Current block height', example: 123456 })
  blockHeight: number;
}
