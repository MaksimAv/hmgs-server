import {
  Get,
  NotFoundException,
  NotImplementedException,
  Param,
} from '@nestjs/common';
import {
  BaseEntity,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

/* eslint-disable @typescript-eslint/require-await */

export abstract class BaseCrudController<
  T extends BaseEntity & { id: number },
> {
  protected relations: FindOptionsRelations<T>;
  protected select: FindOptionsSelect<T>;

  public constructor(protected readonly repository: Repository<T>) {}

  @Get()
  public async findMany() {
    await this.canFind();
    const entities = await this.repository.find({
      select: this.select,
      relations: this.relations,
    });
    if (entities.length === 0) throw new NotFoundException();
    return entities;
  }

  @Get(':id')
  public async findOne(@Param('id') id: number) {
    await this.canFind();
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      select: this.select,
      relations: this.relations,
    });
    if (!entity) throw new NotFoundException();
    return entity;
  }

  public async create() {
    await this.canCreate();
  }

  public async update() {
    await this.canUpdate();
  }

  public async delete() {
    await this.canDelete();
  }

  protected canFind(): Promise<void> {
    throw new NotImplementedException();
  }

  protected async canCreate(): Promise<void> {
    throw new NotImplementedException();
  }

  protected async canUpdate(): Promise<void> {
    throw new NotImplementedException();
  }

  protected async canDelete(): Promise<void> {
    throw new NotImplementedException();
  }
}
