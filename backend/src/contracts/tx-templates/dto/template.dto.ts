import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Unique ID for the template',
    example: 'stx-transfer-premium',
  })
  @IsString()
  templateId: string;

  @ApiProperty({
    description: 'Average size in bytes',
    example: 180,
  })
  @IsNumber()
  sizeBytes: number;

  @ApiProperty({
    description: 'Average gas units',
    example: 1000,
  })
  @IsNumber()
  gasUnits: number;

  @ApiProperty({
    description: 'Template description',
    example: 'A premium STX transfer with extra metadata',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Category (e.g., transfer, dex, nft)',
    example: 'transfer',
  })
  @IsString()
  category: string;
}

export class UpdateTemplateDto {
  @ApiProperty({
    description: 'New average size in bytes',
    example: 190,
  })
  @IsNumber()
  newSizeBytes: number;

  @ApiProperty({
    description: 'New average gas units',
    example: 1100,
  })
  @IsNumber()
  newGasUnits: number;
}

export class InitializeTemplatesDto {
  @ApiProperty({
    description: 'The fee oracle contract address',
    example: 'STY1XRRA93GJP9YMS2CTHB6M08M11BKPDVRM0191',
  })
  @IsString()
  oracleAddress: string;
}
