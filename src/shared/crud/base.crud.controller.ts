import { Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { BaseCrudService } from './base.crud.service';
import { DeepPartial, ObjectLiteral } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class BaseCrudController<T extends ObjectLiteral> {
  constructor(private readonly baseService: BaseCrudService<T>) {}

  @Post()
  async create(@Body() data: DeepPartial<T>): Promise<T> {
    return this.baseService.create(data);
  }

  @Get()
  async findAll(): Promise<T[]> {
    return this.baseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<T | null> {
    return this.baseService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: QueryDeepPartialEntity<T>,
  ): Promise<T | null> {
    return this.baseService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<boolean> {
    return this.baseService.delete(id);
  }
}
