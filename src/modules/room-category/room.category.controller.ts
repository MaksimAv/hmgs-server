import { Controller } from '@nestjs/common';
import { RoomCategoryService } from './room.category.service';
import { BaseCrudController } from '../../shared/crud/base.crud.controller';
import { RoomCategory } from './entities/room.category.entity';

@Controller('room-categories')
export class RoomCategoryController extends BaseCrudController<RoomCategory> {
  constructor(private readonly roomCategoryService: RoomCategoryService) {
    super(roomCategoryService);
  }
}
