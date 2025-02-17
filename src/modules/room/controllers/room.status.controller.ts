import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoomStatusService } from '../services/room.status.service';
import { RoomDatesPeriod } from '../types/room.types';
import { SetRoomStatusDto } from '../dto/set.room.status.dto';
import { RoomStatusEnum } from '../enums/room.status.enum';
import { singleDateSchema } from '../../../shared/validation/single.date.schema';

@Controller('rooms')
export class RoomStatusController {
  constructor(private readonly roomStatusService: RoomStatusService) {}

  @Get('available/period')
  async getAvailableRoomsByPeriod(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ): Promise<any> {
    const startDate = singleDateSchema.parse(start);
    const endDate = singleDateSchema.parse(end);
    const period: RoomDatesPeriod = { startDate, endDate };
    return await this.roomStatusService.getAvailableRoomsByPeriod(period);
  }

  @Get('unavailable/period')
  async getUnavailableRoomsByPeriod(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ): Promise<any> {
    const startDate = singleDateSchema.parse(start);
    const endDate = singleDateSchema.parse(end);
    const period: RoomDatesPeriod = { startDate, endDate };
    return await this.roomStatusService.getUnavailableRoomsByPeriod(period);
  }

  @Get(':id/status/period')
  async getRoomStatusesByPeriod(
    @Param('id') roomId: number,
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ): Promise<any> {
    const startDate = singleDateSchema.parse(start);
    const endDate = singleDateSchema.parse(end);
    const period: RoomDatesPeriod = { startDate, endDate };
    return await this.roomStatusService.getRoomStatusesByPeriod(roomId, period);
  }

  @Post(':id/status')
  async setRoomStatus(
    @Param('id') roomId: number,
    @Body() body: SetRoomStatusDto,
  ) {
    const period: RoomDatesPeriod = {
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };
    const status = body.status as RoomStatusEnum;
    await this.roomStatusService.setRoomStatus(roomId, period, status);
    return { success: true };
  }
}
