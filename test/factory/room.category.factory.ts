import { faker } from '@faker-js/faker';
import { DataSource, Repository } from 'typeorm';
import { RoomCategory } from '../../src/modules/room-category/room-category.entity';

export class RoomCategoryFactory {
  private repository: Repository<RoomCategory>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(RoomCategory);
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
