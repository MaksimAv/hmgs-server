import { Controller } from '@nestjs/common';
import { RoomCategoryService } from './room.category.service';

@Controller('room-category')
export class RoomCategoryController {
  constructor(private readonly roomCategoryService: RoomCategoryService) {}
}
