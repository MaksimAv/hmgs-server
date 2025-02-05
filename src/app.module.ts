import { Module } from '@nestjs/common';
import { CORE_LAYER } from './core.layer';

@Module({
  imports: [...CORE_LAYER],
})
export class AppModule {}
