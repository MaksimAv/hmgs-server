import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
} from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { addDays, formatISO, isAfter, isBefore, subDays } from 'date-fns';
import { RoomService } from '../room/room.service';
import { RoomDatesPeriod } from '../room/types/room';
import { RoomPrice } from './room-price.entity';
import { Room } from '../room/room.entity';
import { calculateDaysBetween } from '../../shared/utils/date-time.utils';

@Injectable()
export class RoomPriceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly roomService: RoomService,

    @InjectRepository(RoomPrice)
    private readonly repository: Repository<RoomPrice>,
  ) {}

  async getByPeriod(
    roomId: number,
    period: RoomDatesPeriod,
  ): Promise<RoomPrice[]> {
    return await this.repository
      .createQueryBuilder('price')
      .where('price.roomId = :roomId', { roomId })
      .andWhere('(price.startDate <= :end AND price.endDate >= :start)', {
        start: period.startDate,
        end: period.endDate,
      })
      .getMany();
  }

  async getByDate(roomId: number, date: Date): Promise<RoomPrice> {
    const price = await this.repository
      .createQueryBuilder('price')
      .where('price.roomId = :roomId', { roomId })
      .andWhere('price.startDate <= :date', { date })
      .andWhere('price.endDate >= :date', { date })
      .getOne();
    if (!price) throw new NotFoundException();
    return price;
  }

  async calculatePrice(room: Room, period: RoomDatesPeriod): Promise<number> {
    const roomPrices = await this.getByPeriod(room.id, period);

    let totalPrice = 0;
    let currentStartDate = period.startDate;
    const endDate = period.endDate;

    if (roomPrices.length === 0) {
      const daysBetween = calculateDaysBetween(currentStartDate, endDate);
      return daysBetween * room.regularPrice;
    }

    for (const roomPrice of roomPrices) {
      if (currentStartDate < roomPrice.startDate) {
        const daysBetween = calculateDaysBetween(
          currentStartDate,
          roomPrice.startDate,
        );
        totalPrice += daysBetween * room.regularPrice;
        currentStartDate = roomPrice.startDate;
      }

      const roomPriceDays = calculateDaysBetween(
        currentStartDate,
        roomPrice.startDate,
      );
      totalPrice += roomPriceDays * roomPrice.price;
      currentStartDate = roomPrice.endDate;
    }

    if (currentStartDate < endDate) {
      const remainingDays = calculateDaysBetween(currentStartDate, endDate);
      totalPrice += remainingDays * room.regularPrice;
    }

    return totalPrice;
  }

  async set(
    roomId: number,
    period: RoomDatesPeriod,
    price: number,
    externalQueryRunner?: QueryRunner,
  ): Promise<RoomPrice> {
    const isRoomExist = await this.roomService.isExistById(roomId);
    if (!isRoomExist) throw new NotFoundException();

    const queryRunner =
      externalQueryRunner ?? this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const overlaps = await this.getOverlaps(roomId, period, manager);
      await this.splitOverlaps(overlaps, period, manager);
      const newPrice = await this.saveNew(roomId, period, price, manager);
      await queryRunner.commitTransaction();
      return newPrice;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      if (!externalQueryRunner) await queryRunner.release();
    }
  }

  private async getOverlaps(
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

  private async splitOverlaps(
    existingPrices: RoomPrice[],
    newPeriod: RoomDatesPeriod,
    manager: EntityManager,
  ) {
    for (const exist of existingPrices) {
      const roomId = exist.roomId;

      await manager.remove(exist);

      // existStartDate > newStartDate and
      // existEndDate < newEndDate
      const isFullOverlap =
        isAfter(exist.startDate, newPeriod.startDate) &&
        isBefore(exist.endDate, newPeriod.endDate);

      if (!isFullOverlap) {
        const newEntries: RoomPrice[] = [];
        // existStartDate < newStartDate
        if (isBefore(exist.startDate, newPeriod.startDate)) {
          const before = this.repository.create({
            ...exist,
            endDate: formatISO(subDays(newPeriod.startDate, 1)),
            room: { id: roomId },
          });
          newEntries.push(before);
        }
        // existStartDate > newEndDate
        if (isAfter(exist.endDate, newPeriod.endDate)) {
          const after = this.repository.create({
            ...exist,
            startDate: formatISO(addDays(newPeriod.endDate, 1)),
            room: { id: roomId },
          });
          newEntries.push(after);
        }
        await manager.save(newEntries);
      }
    }
  }

  private async saveNew(
    roomId: number,
    newPeriod: RoomDatesPeriod,
    newPrice: number,
    manager: EntityManager,
  ) {
    const newRoomPrice = this.repository.create({
      room: { id: roomId },
      startDate: newPeriod.startDate,
      endDate: newPeriod.endDate,
      price: newPrice,
    });
    return await manager.save(newRoomPrice);
  }
}
