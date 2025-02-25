import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPEORM_MODULE_CONFIG } from './config/typeorm.module.config';

@Module({
  imports: [TypeOrmModule.forRootAsync(TYPEORM_MODULE_CONFIG)],
})
export class DatabaseModule {}
