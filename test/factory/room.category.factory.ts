import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { RoomCategory } from '../../src/modules/room-category/room-category.entity';
import { AbstractEntityFactory } from './abstract';

export class RoomCategoryFactory extends AbstractEntityFactory<RoomCategory> {
  constructor(dataSource: DataSource) {
    super(RoomCategory, dataSource);
  }

  async create(overrides: Partial<RoomCategory> = {}): Promise<RoomCategory> {
    const newRoomCategory = this.createEntity(overrides);
    return await this.repository.save(newRoomCategory);
  }

  async createMany(
    count: number,
    overrides: Partial<RoomCategory> = {},
  ): Promise<RoomCategory[]> {
    const newRoomCategoriesToSave: RoomCategory[] = [];
    for (let i = 0; i < count; i += 1) {
      const newRoomCategory = this.createEntity(overrides);
      newRoomCategoriesToSave.push(newRoomCategory);
    }
    return await this.repository.save(newRoomCategoriesToSave);
  }

  createEntity(overrides: Partial<RoomCategory> = {}): RoomCategory {
    const title = faker.commerce.department();
    return this.repository.create({
      title,
      slug: faker.helpers.slugify(title),
      description: faker.lorem.sentences(),
      ...overrides,
    });
  }
}
