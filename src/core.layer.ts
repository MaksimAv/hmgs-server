import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullModule } from '@nestjs/bullmq';

const ENV_FILE = process.env.ENV_FILE || '.env';

export const CORE_LAYER = [
  ConfigModule.forRoot({
    isGlobal: true,
    expandVariables: true,
    envFilePath: ENV_FILE,
  }),
  BullModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
      connection: {
        url: configService.getOrThrow<string>('REDIS_QUEUE_URI'),
      },
    }),
    inject: [ConfigService],
  }),
  BullBoardModule.forRoot({
    route: 'system/queues',
    adapter: ExpressAdapter,
  }),
  DatabaseModule,
];
