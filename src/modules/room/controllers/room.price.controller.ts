import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetRoomPriceResponse } from 'hmgs-contracts';
import { RoomPriceService } from '../services/room.price.service';
import { singleDateSchema } from 'src/shared/validation/single.date.schema';
import { RoomDatesPeriod } from '../types/room.types';
import { SetRoomPriceDto } from '../dto/set.room.price.dto';

@Controller('room')
export class RoomPriceController {
  constructor(private readonly roomPriceService: RoomPriceService) {}

  @Get(':id/price/period')
  async getRoomPriceByPeriod(
    @Param('id') roomId: number,
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ): Promise<GetRoomPriceResponse[]> {
    const startDate = singleDateSchema.parse(start);
    const endDate = singleDateSchema.parse(end);
    const period: RoomDatesPeriod = { startDate, endDate };
    return await this.roomPriceService.getRoomPriceByPeriod(roomId, period);
  }

  @Get(':id/price')
  async getRoomPriceDate(
    @Param('id') roomId: number,
    @Query('date') targetDate: string,
  ): Promise<GetRoomPriceResponse> {
    const date = singleDateSchema.parse(targetDate);
    return await this.roomPriceService.getRoomPriceByDate(roomId, date);
  }

  @Post(':id/price')
  async setRoomPrice(
    @Param('id') roomId: number,
    @Body() body: SetRoomPriceDto,
  ) {
    const period: RoomDatesPeriod = {
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };
    await this.roomPriceService.setRoomPrice(roomId, period, body.price);
    return { success: true };
  }
}
