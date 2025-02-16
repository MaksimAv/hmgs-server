import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoomService } from '../services/room.service';
import { CreateRoomDto } from '../dto/create.room.dto';

@Controller('rooms')
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
}
