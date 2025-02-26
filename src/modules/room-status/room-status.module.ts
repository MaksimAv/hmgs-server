import { Module } from '@nestjs/common';
import { RoomStatusService } from './room-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomStatus } from './room-status.entity';
import { RoomStatusController } from './room-status.controller';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [RoomModule, TypeOrmModule.forFeature([RoomStatus])],
  controllers: [RoomStatusController],
  providers: [RoomStatusService],
  exports: [RoomStatusService],
})
export class RoomStatusModule {}
