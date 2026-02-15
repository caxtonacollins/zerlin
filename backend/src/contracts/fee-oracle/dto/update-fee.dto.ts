import { IsNumber, IsString } from 'class-validator';

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
