import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomPrice } from './entities/room.price.entity';
import { RoomCategory } from './entities/room.category.entity';
import { RoomStatus } from './entities/room.status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomPrice, RoomCategory, RoomStatus]),
  ],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
