import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Alert } from './entities/alert.entity';
import { FeeEstimate } from './entities/fee-estimate.entity';
import { NetworkStatus } from './entities/network-status.entity';
import { StacksModule } from './stacks/stacks.module';
import { RedisModule } from './redis/redis.module';
import { FeeModule } from './fee/fee.module';
import { TasksModule } from './tasks/tasks.module';
import { FeeOracleModule } from './contracts/fee-oracle/fee-oracle.module';
import { SmartAlertsModule } from './contracts/smart-alerts/smart-alerts.module';
import { TxTemplatesModule } from './contracts/tx-templates/tx-templates.module';

@Module({
  imports: [
    TasksModule,
    FeeModule,
    FeeOracleModule,
    SmartAlertsModule,
    TxTemplatesModule,
    StacksModule,
    RedisModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [FeeEstimate, NetworkStatus, User, Alert],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
