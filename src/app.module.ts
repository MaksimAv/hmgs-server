import { Module } from '@nestjs/common';
import { RoomModule } from './modules/room/room.module';
import { CORE_LAYER } from './core.layer';
import { APP_FILTER } from '@nestjs/core';
import { ZodExceptionFilter } from './shared/app-filters/zod.exception.filter';
import { RoomCategoryModule } from './modules/room-category/room.category.module';

@Module({
  imports: [...CORE_LAYER, RoomModule, RoomCategoryModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter,
    },
  ],
})
export class AppModule {}
