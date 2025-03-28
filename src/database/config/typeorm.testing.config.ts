import * as dotenv from 'dotenv';
import * as assert from 'assert';
import { DataSource } from 'typeorm';

dotenv.config({ path: '.env.test' });

assert(process.env.POSTGRES_DB, 'POSTGRES_DB is required');

export const TESTING_DATA_SOURCE = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
  logging: false,
  synchronize: false,
});
