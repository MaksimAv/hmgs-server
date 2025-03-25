import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetRoomPriceResponse } from 'hmgs-contracts';
import { RoomPriceService } from './room-price.service';
import { SetRoomPriceDto } from './dto/set-room-price.dto';
import { RoomDatesPeriod } from '../room/types/room';
import { singleDateSchema } from '../../shared/validation/single.date.schema';

@Controller('room-prices')
export class RoomPriceController {
  constructor(private readonly roomPriceService: RoomPriceService) {}

  @Get(':roomId')
  async getRoomPriceByPeriod(
    @Param('roomId') roomId: number,
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ): Promise<GetRoomPriceResponse[]> {
    const startDate = singleDateSchema.parse(start);
    const endDate = singleDateSchema.parse(end);
    const period: RoomDatesPeriod = { startDate, endDate };
    return await this.roomPriceService.getByPeriod(roomId, period);
  }

  @Get(':roomId/day')
  async getRoomPriceDate(
    @Param('roomId') roomId: number,
    @Query('date') targetDate: string,
  ): Promise<GetRoomPriceResponse> {
    const date = singleDateSchema.parse(targetDate);
    return await this.roomPriceService.getByDate(roomId, date);
  }

  @Post(':roomId')
  async setRoomPrice(
    @Param('roomId') roomId: number,
    @Body() body: SetRoomPriceDto,
  ) {
    const period: RoomDatesPeriod = {
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };
    return await this.roomPriceService.set(roomId, period, body.price);
  }
}
