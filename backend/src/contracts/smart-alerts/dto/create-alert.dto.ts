import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsEmail } from 'class-validator';

export class CreateAlertDto {
  @ApiProperty({
    description: 'The stacks address of the user',
    example: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    default: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
  })
  @IsString()
  userAddress: string;

  @ApiProperty({
    description: 'Email for notifications (optional)',
    example: 'user@example.com',
    required: false,
    default: 'user@example.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Fee threshold in micro-STX',
    example: 1000,
    default: 250
  })
  @IsNumber()
  targetFee: number;

  @ApiProperty({
    description: 'Trigger condition',
    enum: ['ABOVE', 'BELOW'],
    example: 'BELOW',
    default: 'BELOW'
  })
  @IsEnum(['ABOVE', 'BELOW'])
  condition: 'ABOVE' | 'BELOW';
}
