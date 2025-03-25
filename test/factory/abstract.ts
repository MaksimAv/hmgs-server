import { DataSource, ObjectLiteral, Repository, EntityTarget } from 'typeorm';

export abstract class AbstractEntityFactory<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(
    protected entity: EntityTarget<T>,
    protected dataSource: DataSource,
  ) {
    this.repository = this.dataSource.getRepository(entity);
  }

  abstract create(overrides?: Partial<T>): Promise<T>;

  abstract createMany(count: number, overrides?: Partial<T>): Promise<T[]>;

  abstract createEntity(overrides: Partial<T>): T;
}
