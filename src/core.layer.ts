import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

export const CORE_LAYER = [
  ConfigModule.forRoot({
    isGlobal: true,
    expandVariables: true,
  }),
  DatabaseModule,
];
