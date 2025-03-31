import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomCategoryDto } from './dto/create-room-category.dto';
import { RoomCategory } from './room-category.entity';

@Injectable()
export class RoomCategoryService {
  constructor(
    @InjectRepository(RoomCategory)
    private readonly roomCategoryRepository: Repository<RoomCategory>,
  ) {}

  async create(data: CreateRoomCategoryDto) {
    const newRoomCategory = this.roomCategoryRepository.create({
      title: data.title,
      slug: data.slug,
      description: data.description,
    });
    return await this.roomCategoryRepository.save(newRoomCategory);
  }

  async findAll() {
    return await this.roomCategoryRepository.find();
  }

  async findOne(id: number) {
    const roomCategory = await this.roomCategoryRepository.findOneBy({ id });
    if (!roomCategory) throw new NotFoundException();
    return roomCategory;
  }

  async remove(id: number) {
    const roomCategory = await this.findOne(id);
    return await this.roomCategoryRepository.remove(roomCategory);
  }
}
