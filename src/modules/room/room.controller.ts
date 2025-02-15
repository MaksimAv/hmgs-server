import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomDatesPeriod } from './room.types';
import { CreateRoomDto } from './dto/create.room.dto';
import { SetRoomPriceDto } from './dto/set.room.price.dto';
import { GetRoomPriceResponse } from 'hmgs-contracts';
import { singleDateSchema } from 'src/shared/validation/single.date.schema';

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
  async create(@Body() body: CreateRoomDto) {
    return await this.roomService.create(body);
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
  ): Promise<GetRoomPriceResponse[]> {
    const startDate = singleDateSchema.parse(start);
    const endDate = singleDateSchema.parse(end);
    const period: RoomDatesPeriod = { startDate, endDate };
    return await this.roomService.getRoomPriceByPeriod(roomId, period);
  }

  @Get(':id/price')
  async getRoomPriceDate(
    @Param('id') roomId: number,
    @Query('date') targetDate: string,
  ): Promise<GetRoomPriceResponse> {
    const date = singleDateSchema.parse(targetDate);
    return await this.roomService.getRoomPriceByDate(roomId, date);
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
    await this.roomService.setRoomPrice(roomId, period, body.price);
    return { success: true };
  }

  @Post(':id/status')
  async setRoomStatus(@Param('id') roomId: number, @Body() body: any) {
    const period: RoomDatesPeriod = {
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };
    await this.roomService.setRoomStatus(roomId, period, body.status);
  }
}
