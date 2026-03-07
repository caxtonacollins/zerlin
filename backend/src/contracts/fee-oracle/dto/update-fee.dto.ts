import { IsNumber, IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFeeRateDto {
  @IsNumber()
  feeRate: number;

  @IsString()
  congestion: string;
}

export class InitializeOracleDto {
  @IsNumber()
  initialFeeRate: number;
}

export class UpdateTransactionAverageDto {
  @ApiProperty({ description: 'Transaction type', example: 'stx-transfer' })
  @IsString()
  txType: string;

  @ApiProperty({ description: 'Observed fee in microSTX', example: 250 })
  @IsNumber()
  observedFee: number;
}

export class BatchUpdateAveragesDto {
  @ApiProperty({
    description: 'Array of transaction updates',
    type: [UpdateTransactionAverageDto],
  })
  @IsArray()
  updates: UpdateTransactionAverageDto[];
}

export class TransferOwnershipDto {
  @ApiProperty({
    description: 'New owner address',
    example: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  })
  @IsString()
  newOwner: string;
}

export class AuthorizeOracleDto {
  @ApiProperty({
    description: 'Oracle address to authorize',
    example: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  })
  @IsString()
  oracleAddress: string;
}

export class RevokeOracleDto {
  @ApiProperty({
    description: 'Oracle address to revoke',
    example: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  })
  @IsString()
  oracleAddress: string;
}

export class GetFeeAtBlockDto {
  @ApiProperty({ description: 'Block height', example: 12345 })
  @IsNumber()
  blockHeight: number;
}

export class GetTransactionAverageDto {
  @ApiProperty({ description: 'Transaction type', example: 'stx-transfer' })
  @IsString()
  txType: string;
}

export class EstimateSwapFeeDto {
  @ApiProperty({ description: 'DEX name', example: 'alex' })
  @IsString()
  dexName: string;
}

export class IsAuthorizedOracleDto {
  @ApiProperty({
    description: 'Oracle address to check',
    example: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  })
  @IsString()
  oracleAddress: string;
}
