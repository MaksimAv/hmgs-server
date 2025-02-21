import { Module } from '@nestjs/common';
import { RoomModule } from './modules/room/room.module';
import { CORE_LAYER } from './core.layer';
import { APP_FILTER } from '@nestjs/core';
import { ZodExceptionFilter } from './shared/filters/zod.exception.filter';
import { RoomCategoryModule } from './modules/room-category/room.category.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingModule } from './modules/booking/booking.module';

@Module({
  imports: [
    ...CORE_LAYER,
    RoomModule,
    RoomCategoryModule,
    UserModule,
    AuthModule,
    BookingModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter,
    },
  ],
})
export class AppModule {}
