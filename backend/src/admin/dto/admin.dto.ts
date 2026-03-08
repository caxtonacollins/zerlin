import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleAlertDto {
  @ApiProperty({ description: 'Active status' })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateFeeRateDto {
  @ApiProperty({ description: 'Fee rate in microSTX/byte' })
  @IsNumber()
  feeRate: number;

  @ApiProperty({ description: 'Congestion level' })
  @IsString()
  congestion: string;
}

export class AuthorizeOracleDto {
  @ApiProperty({ description: 'Oracle address to authorize' })
  @IsString()
  oracleAddress: string;
}

export class RevokeOracleDto {
  @ApiProperty({ description: 'Oracle address to revoke' })
  @IsString()
  oracleAddress: string;
}
