import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoomStatusService } from './room-status.service';
import { RoomDatesPeriod } from '../room/types/room';
import { SetRoomStatusDto } from './dto/set-room-status.dto';
import { RoomStatusEnum } from './room-status.enum';
import { singleDateSchema } from '../../shared/validation/single.date.schema';

@Controller('rooms')
export class RoomStatusController {
  constructor(private readonly roomStatusService: RoomStatusService) {}

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
    const status = body.status as unknown as RoomStatusEnum;
    await this.roomStatusService.setRoomStatus(roomId, period, status);
    return { success: true };
  }
}
