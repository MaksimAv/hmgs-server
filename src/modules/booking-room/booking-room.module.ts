import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingRoom } from './booking-room.entity';
import { RoomStatusModule } from '../room-status/room-status.module';
import { BookingRoomService } from './booking-room.service';
import { RoomPriceModule } from '../room-price/room-price.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingRoom]),
    RoomModule,
    RoomStatusModule,
    RoomPriceModule,
  ],
  providers: [BookingRoomService],
  exports: [BookingRoomService],
})
export class BookingRoomModule {}
