import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const TYPEORM_MODULE_CONFIG = {
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST'),
    port: configService.get<number>('POSTGRES_PORT'),
    username: configService.get<string>('POSTGRES_USER'),
    password: configService.get<string>('POSTGRES_PASSWORD'),
    database: configService.get<string>('POSTGRES_DB'),
    synchronize: configService.get<string>('POSTGRES_SYNCHRONIZE') === 'true',
    logging: configService.get<string>('POSTGRES_LOGGING') === 'true',
    entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
  }),
  inject: [ConfigService],
};
