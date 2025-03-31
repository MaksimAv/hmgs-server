import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { RoomCategoryService } from './room-category.service';
import { CreateRoomCategoryDto } from './dto/create-room-category.dto';

@Controller('room-categories')
export class RoomCategoryController {
  constructor(private readonly roomCategoryService: RoomCategoryService) {}

  @Post()
  create(@Body() body: CreateRoomCategoryDto) {
    return this.roomCategoryService.create(body);
  }

  @Get()
  findAll() {
    return this.roomCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomCategoryService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomCategoryService.remove(+id);
  }
}
