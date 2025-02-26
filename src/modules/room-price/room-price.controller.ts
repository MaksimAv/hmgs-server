import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetRoomPriceResponse } from 'hmgs-contracts';
import { RoomPriceService } from './room-price.service';
import { SetRoomPriceDto } from './dto/set-room-price.dto';
import { RoomDatesPeriod } from '../room/types/room';
import { singleDateSchema } from '../../shared/validation/single.date.schema';

@Controller('rooms')
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
    return await this.roomPriceService.getByPeriod(roomId, period);
  }

  @Get(':id/price')
  async getRoomPriceDate(
    @Param('id') roomId: number,
    @Query('date') targetDate: string,
  ): Promise<GetRoomPriceResponse> {
    const date = singleDateSchema.parse(targetDate);
    return await this.roomPriceService.getByDate(roomId, date);
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
    await this.roomPriceService.setByPeriod(roomId, period, body.price);
    return { success: true };
  }
}
