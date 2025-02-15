import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { RoomPrice } from '../entities/room.price.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomDatesPeriod } from '../types/room.types';
import { addDays, formatISO, isAfter, isBefore, subDays } from 'date-fns';
import { RoomService } from './room.service';

@Injectable()
export class RoomPriceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly roomService: RoomService,

    @InjectRepository(RoomPrice)
    private readonly roomPriceRepository: Repository<RoomPrice>,
  ) {}

  async getRoomPriceByPeriod(
    roomId: number,
    period: RoomDatesPeriod,
  ): Promise<RoomPrice[]> {
    return await this.roomPriceRepository
      .createQueryBuilder('price')
      .where('price.roomId = :roomId', { roomId })
      .andWhere('(price.startDate <= :end AND price.endDate >= :start)', {
        start: period.startDate,
        end: period.endDate,
      })
      .getMany();
  }

  async getRoomPriceByDate(roomId: number, date: Date): Promise<RoomPrice> {
    const price = await this.roomPriceRepository
      .createQueryBuilder('price')
      .where('price.roomId = :roomId', { roomId })
      .andWhere('price.startDate <= :date', { date })
      .andWhere('price.endDate >= :date', { date })
      .getOne();
    if (!price) throw new NotFoundException();
    return price;
  }

  async setRoomPrice(
    roomId: number,
    period: RoomDatesPeriod,
    price: number,
  ): Promise<void> {
    const isRoomExist = await this.roomService.isExistById(roomId);
    if (!isRoomExist) throw new NotFoundException();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const overlaps = await this.getOverlapRoomPrice(
        roomId,
        period,
        queryRunner.manager,
      );

      for (const overlap of overlaps) {
        await this.splitOverlapRoomPrice(overlap, period, queryRunner.manager);
      }

      await this.createRoomPrice(roomId, period, price, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async getOverlapRoomPrice(
    roomId: number,
    period: RoomDatesPeriod,
    manager: EntityManager,
  ) {
    return await manager.getRepository(RoomPrice).find({
      where: {
        room: { id: roomId },
        startDate: LessThanOrEqual(period.endDate),
        endDate: MoreThanOrEqual(period.startDate),
      },
      relations: { room: true },
    });
  }

  private async splitOverlapRoomPrice(
    exist: RoomPrice,
    newPeriod: RoomDatesPeriod,
    manager: EntityManager,
  ) {
    const roomId = exist.roomId;
    await manager.remove(exist);

    // existStartDate > newStartDate and existEndDate < newEndDate
    if (
      isAfter(exist.startDate, newPeriod.startDate) &&
      isBefore(exist.endDate, newPeriod.endDate)
    ) {
      return;
    }

    // existStartDate < newStartDate and existEndDate > newEndDate
    if (
      isBefore(exist.startDate, newPeriod.startDate) &&
      isAfter(exist.endDate, newPeriod.endDate)
    ) {
      const newBeforePeriod = this.roomPriceRepository.create({
        ...exist,
        endDate: formatISO(subDays(newPeriod.startDate, 1)),
        room: { id: roomId },
      });
      const newAfterPeriod = this.roomPriceRepository.create({
        ...exist,
        startDate: formatISO(addDays(newPeriod.endDate, 1)),
        room: { id: roomId },
      });
      await manager.save([newBeforePeriod, newAfterPeriod]);
      return;
    }

    // existStartDate < newStartDate
    if (isBefore(exist.startDate, newPeriod.startDate)) {
      const before = this.roomPriceRepository.create({
        ...exist,
        endDate: formatISO(subDays(newPeriod.startDate, 1)),
        room: { id: roomId },
      });
      await manager.save(before);
      return;
    }

    // existStartDate > newEndDate
    if (isAfter(exist.endDate, newPeriod.endDate)) {
      const after = this.roomPriceRepository.create({
        ...exist,
        startDate: formatISO(addDays(newPeriod.endDate, 1)),
        room: { id: roomId },
      });
      await manager.save(after);
      return;
    }
  }

  private async createRoomPrice(
    roomId: number,
    newPeriod: RoomDatesPeriod,
    newPrice: number,
    manager: EntityManager,
  ) {
    const newRoomPrice = this.roomPriceRepository.create({
      room: { id: roomId },
      startDate: newPeriod.startDate,
      endDate: newPeriod.endDate,
      price: newPrice,
    });
    return await manager.save(newRoomPrice);
  }
}
