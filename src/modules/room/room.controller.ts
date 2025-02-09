import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomPricePeriod } from './room.types';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getMany() {
    return await this.roomService.getMany();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return await this.roomService.getOneById(id);
  }

  @Post()
  async create(@Body() payload: any) {
    return await this.roomService.create(payload);
  }

  // @Patch(':id')
  // async update(@Param('id') id: number) {}

  // @Delete(':id')
  // async delete(@Param('id') id: number) {}

  @Get(':id/price/period')
  async getRoomPriceByPeriod(
    @Param('id') roomId: number,
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return await this.roomService.getRoomPriceByPeriod(roomId, {
      startDate,
      endDate,
    });
  }

  @Get(':id/price/day')
  async getRoomPriceDate(
    @Param('id') roomId: number,
    @Query('date') date: string,
  ) {
    const targetDate = new Date(date);
    return await this.roomService.getRoomPriceByDate(roomId, targetDate);
  }

  @Post(':id/price')
  async setRoomPrice(
    @Param('id') roomId: number,
    @Body()
    roomPrice: {
      startDate: Date;
      endDate: Date;
      price: number;
    },
  ) {
    const period: RoomPricePeriod = {
      startDate: new Date(roomPrice.startDate),
      endDate: new Date(roomPrice.endDate),
    };
    await this.roomService.setRoomPrice(roomId, period, roomPrice.price);
    return { success: true };
  }
}
