import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('float')
  targetFee: number;

  @Column({
    type: 'enum',
    enum: ['ABOVE', 'BELOW'],
    default: 'BELOW'
  })
  condition: 'ABOVE' | 'BELOW';

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.alerts)
  user: User;
}
