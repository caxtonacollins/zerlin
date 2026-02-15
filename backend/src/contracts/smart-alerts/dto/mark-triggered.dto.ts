import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class MarkTriggeredDto {
  @ApiProperty({
    description: 'The stacks address of the user',
    example: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  })
  @IsString()
  userAddress: string;

  @ApiProperty({
    description: 'The alert ID',
    example: 1,
  })
  @IsNumber()
  alertId: number;

  @ApiProperty({
    description: 'The current fee in micro-STX',
    example: 100,
  })
  @IsNumber()
  currentFee: number;
}

export class InitializeSmartAlertsDto {
  @ApiProperty({
    description: 'The fee oracle contract address',
    example: 'STY1XRRA93GJP9YMS2CTHB6M08M11BKPDVRM0191',
  })
  @IsString()
  oracleAddress: string;
}
