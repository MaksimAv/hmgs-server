import { faker } from '@faker-js/faker';
import { DataSource, Repository } from 'typeorm';
import { RoomCategoryFactory } from './room.category.factory';
import { Room } from '../../src/modules/room/entities/room.entity';

type RoomRelationsIds = {
  categoryId: number;
};

export class RoomFactory {
  private roomRepository: Repository<Room>;

  constructor(private dataSource: DataSource) {
    this.roomRepository = this.dataSource.getRepository(Room);
  }

  async create(overrides: Partial<Room> = {}): Promise<Room> {
    const relationIds = await this.createRelations();
    const newRoom = this.createEntity(relationIds, overrides);
    return await newRoom.save();
  }

  async createMany(
    count: number,
    overrides: Partial<Room> = {},
  ): Promise<Room[]> {
    const relationIds = await this.createRelations();
    const newRoomsToSave: Room[] = [];
    for (let i = 0; i < count; i += 1) {
      const newRoom = this.createEntity(relationIds, overrides);
      newRoomsToSave.push(newRoom);
    }
    return await this.roomRepository.save(newRoomsToSave);
  }

  private async createRelations(): Promise<RoomRelationsIds> {
    const category = await new RoomCategoryFactory(this.dataSource).create();
    return { categoryId: category.id };
  }

  private createEntity(
    relationIds: RoomRelationsIds,
    overrides: Partial<Room> = {},
  ): Room {
    const title = faker.word.words();
    return this.roomRepository.create({
      title,
      slug: faker.helpers.slugify(title),
      description: faker.lorem.sentences(),
      categoryId: relationIds.categoryId,
      capacity: faker.number.int({ min: 2, max: 6 }),
      cleaningStatus: 'CLEAN',
      currencyCode: faker.finance.currencyCode(),
      floor: faker.number.int({ min: 1, max: 9 }),
      size: faker.number.int({ min: 16, max: 50 }),
      minStayDays: 3,
      maxStayDays: 90,
      visibility: 'PUBLIC',
      regularPrice: +faker.finance.amount({ min: 1000, max: 9000, dec: 2 }),
      ...overrides,
    });
  }
}
