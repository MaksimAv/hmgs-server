import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { singleDateSchema } from '../../shared/validation/single.date.schema';
import { RoomDatesPeriod } from './types/room';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('available')
  async getAvailableRoomsByPeriod(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ): Promise<any> {
    const startDate = singleDateSchema.parse(start);
    const endDate = singleDateSchema.parse(end);
    const period: RoomDatesPeriod = { startDate, endDate };
    return await this.roomService.getAvailableByPeriod(period);
  }

  @Get('unavailable')
  async getUnavailableRoomsByPeriod(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ): Promise<any> {
    const startDate = singleDateSchema.parse(start);
    const endDate = singleDateSchema.parse(end);
    const period: RoomDatesPeriod = { startDate, endDate };
    return await this.roomService.getUnavailableByPeriod(period);
  }

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
}
