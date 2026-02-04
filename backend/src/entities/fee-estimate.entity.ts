import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class FeeEstimate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionType: string;

  @Column('jsonb')
  estimatedFee: {
    stx: string;
    usd: string;
    microStx: number;
    btc: number;
  };

  @Column('jsonb')
  breakdown: {
    baseFee: number;
    executionCost: number;
    dataSize: number;
  };

  @Column('jsonb')
  networkStatus: {
    congestion: string;
    averageFee: number;
    recommendedBuffer: number;
  };

  @CreateDateColumn()
  createdAt: Date;
}
