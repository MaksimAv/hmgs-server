import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingRoomModule } from '../booking-room/booking-room.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), BookingRoomModule, UserModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
