import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export const CORE_LAYER = [
  ConfigModule.forRoot({
    isGlobal: true,
    expandVariables: true,
  }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    logging: true,
    autoLoadEntities: true,
    synchronize: true,
  }),
];
