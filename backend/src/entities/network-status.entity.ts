import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class NetworkStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  congestionLevel: string;

  @Column('float')
  averageFeeRate: number;

  @Column('int')
  mempoolSize: number;

  @Column('int')
  blockHeight: number;

  @CreateDateColumn()
  createdAt: Date;
}
