import { Module } from '@nestjs/common';
import { RoomCategoryService } from './room-category.service';
import { RoomCategoryController } from './room-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomCategory } from './room-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomCategory])],
  controllers: [RoomCategoryController],
  providers: [RoomCategoryService],
})
export class RoomCategoryModule {}
