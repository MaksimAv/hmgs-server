import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export const TYPEORM_MODULE = TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST'),
    port: configService.get<number>('POSTGRES_PORT'),
    username: configService.get<string>('POSTGRES_USER'),
    password: configService.get<string>('POSTGRES_PASSWORD'),
    database: configService.get<string>('POSTGRES_DB'),
    synchronize: configService.get<boolean>('POSTGRES_SYNCHRONIZE'),
    logging: configService.get<boolean>('POSTGRES_LOGGING'),
    entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
  }),
  inject: [ConfigService],
});
