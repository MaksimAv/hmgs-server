import { ConfigModule } from '@nestjs/config';
import { TYPEORM_MODULE } from './database/config/typeorm.module.config';

export const CORE_LAYER = [
  ConfigModule.forRoot({
    isGlobal: true,
    expandVariables: true,
  }),
  TYPEORM_MODULE,
];
