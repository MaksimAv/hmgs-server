import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomCategory } from './entities/room.category.entity';
import { BaseCrudService } from '../../shared/crud/base.crud.service';
import { Repository } from 'typeorm';

@Injectable()
export class RoomCategoryService extends BaseCrudService<RoomCategory> {
  constructor(
    @InjectRepository(RoomCategory)
    private readonly roomCategoryRepository: Repository<RoomCategory>,
  ) {
    super(roomCategoryRepository);
  }
}
