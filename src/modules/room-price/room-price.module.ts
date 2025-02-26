import { Module } from '@nestjs/common';
import { RoomPriceService } from './room-price.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomPriceController } from './room-price.controller';
import { RoomPrice } from './room-price.entity';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [RoomModule, TypeOrmModule.forFeature([RoomPrice])],
  controllers: [RoomPriceController],
  providers: [RoomPriceService],
  exports: [RoomPriceService],
})
export class RoomPriceModule {}
