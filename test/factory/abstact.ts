import { DataSource, ObjectLiteral, Repository } from 'typeorm';

export abstract class AbstractEntityFactory<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(
    protected dataSource: DataSource,
    protected entity: new () => T,
  ) {
    this.repository = this.dataSource.getRepository(entity);
  }

  abstract create(overrides?: Partial<T>): Promise<T>;

  abstract createMany(count: number, overrides?: Partial<T>): Promise<T[]>;

  abstract createEntity(overrides: Partial<T>): T;
}
