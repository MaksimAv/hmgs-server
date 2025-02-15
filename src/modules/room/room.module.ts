import { Module } from '@nestjs/common';
import { RoomService } from './services/room.service';
import { RoomController } from './controllers/room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomPrice } from './entities/room.price.entity';
import { RoomStatus } from './entities/room.status.entity';
import { RoomStatusController } from './controllers/room.status.controller';
import { RoomPriceController } from './controllers/room.price.controller';
import { RoomPriceService } from './services/room.price.service';
import { RoomStatusService } from './services/room.status.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomPrice, RoomStatus])],
  controllers: [RoomController, RoomPriceController, RoomStatusController],
  providers: [RoomService, RoomPriceService, RoomStatusService],
})
export class RoomModule {}
