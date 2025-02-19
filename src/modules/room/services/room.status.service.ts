import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { RoomStatus } from '../entities/room.status.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomDatesPeriod } from '../types/room.types';
import { RoomStatusEnum } from '../enums/room.status.enum';
import { addMinutes, formatISO, isAfter, isBefore, subMinutes } from 'date-fns';
import { RoomService } from './room.service';
import { Room } from '../entities/room.entity';

@Injectable()
export class RoomStatusService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly roomService: RoomService,

    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,

    @InjectRepository(RoomStatus)
    private readonly roomStatusRepository: Repository<RoomStatus>,
  ) {}

  async changeRegularStatus(
    roomId: number,
    status: RoomStatusEnum,
  ): Promise<boolean> {
    const room = await this.roomService.getOneById(roomId);
    if (!room) throw new NotFoundException();

    const availabilityStatuses = this.getAvailabilityStatuses();

    if (availabilityStatuses.includes(status)) {
      room.regularIsAvailable = true;
    } else {
      room.regularIsAvailable = false;
    }

    room.regularStatus = status;

    await room.save();
    return true;
  }

  async getAvailableRoomsByPeriod(period: RoomDatesPeriod) {
    const { startDate, endDate } = period;
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomStatus', 'roomStatus')
      .where('roomStatus.isAvailable = true')
      .andWhere('roomStatus.startDateTime <= :startDate', { startDate })
      .andWhere('roomStatus.endDateTime >= :endDate', { endDate })
      .orWhere('room.regularIsAvailable = true')
      .andWhere(
        `(roomStatus.startDateTime > :endDate
         OR
         roomStatus.endDateTime < :startDate
         OR
         roomStatus.isAvailable != false)`,
        { startDate, endDate },
      )
      .getMany();
    return rooms;
  }

  async getUnavailableRoomsByPeriod(period: RoomDatesPeriod) {
    const { startDate, endDate } = period;
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomStatus', 'roomStatus')
      .where('roomStatus.isAvailable = false')
      .andWhere('roomStatus.startDateTime <= :startDate', { startDate })
      .andWhere('roomStatus.endDateTime >= :endDate', { endDate })
      .orWhere('room.regularIsAvailable = false')
      .andWhere(`roomStatus.id IS NULL`)
      .getMany();
    return rooms;
  }

  async getRoomStatusesByPeriod(
    roomId: number,
    period: RoomDatesPeriod,
  ): Promise<RoomStatus[]> {
    return await this.roomStatusRepository
      .createQueryBuilder('status')
      .where('status.roomId = :roomId', { roomId })
      .andWhere(
        '(status.startDateTime <= :end AND status.endDateTime >= :start)',
        { start: period.startDate, end: period.endDate },
      )
      .getMany();
  }

  async setRoomStatus(
    roomId: number,
    period: RoomDatesPeriod,
    status: RoomStatusEnum,
  ): Promise<void> {
    const isRoomExist = await this.roomService.isExistById(roomId);
    if (!isRoomExist) throw new NotFoundException();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const overlaps = await this.getOverlapRoomStatus(
        roomId,
        period,
        queryRunner.manager,
      );

      for (const overlap of overlaps) {
        await this.splitOverlapRoomStatus(overlap, period, queryRunner.manager);
      }

      await this.createRoomStatus(roomId, period, status, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async getOverlapRoomStatus(
    roomId: number,
    period: RoomDatesPeriod,
    manager: EntityManager,
  ) {
    return await manager.getRepository(RoomStatus).find({
      where: {
        room: { id: roomId },
        startDateTime: LessThanOrEqual(period.endDate),
        endDateTime: MoreThanOrEqual(period.startDate),
      },
      relations: { room: true },
    });
  }

  private async splitOverlapRoomStatus(
    exist: RoomStatus,
    newPeriod: RoomDatesPeriod,
    manager: EntityManager,
  ) {
    const roomId = exist.roomId;
    await manager.remove(exist);

    // existStartDateTime > newStartDateTime and existEndDateTime < newEndDateTime
    if (
      isAfter(exist.startDateTime, newPeriod.startDate) &&
      isBefore(exist.endDateTime, newPeriod.endDate)
    ) {
      return;
    }

    // existStartDateTime < newStartDateTime and existEndDateTime > newEndDateTime
    if (
      isBefore(exist.startDateTime, newPeriod.startDate) &&
      isAfter(exist.endDateTime, newPeriod.endDate)
    ) {
      const newBeforePeriod = this.roomStatusRepository.create({
        ...exist,
        endDateTime: formatISO(subMinutes(newPeriod.startDate, 1)),
        room: { id: roomId },
      });
      const newAfterPeriod = this.roomStatusRepository.create({
        ...exist,
        startDateTime: formatISO(addMinutes(newPeriod.endDate, 1)),
        room: { id: roomId },
      });
      await manager.save([newBeforePeriod, newAfterPeriod]);
      return;
    }

    // existStartDateTime < newStartDateTime
    if (isBefore(exist.startDateTime, newPeriod.startDate)) {
      const before = this.roomStatusRepository.create({
        ...exist,
        endDateTime: formatISO(subMinutes(newPeriod.startDate, 1)),
        room: { id: roomId },
      });
      await manager.save(before);
      return;
    }

    // existStartDateTime > newEndDateTime
    if (isAfter(exist.endDateTime, newPeriod.endDate)) {
      const after = this.roomStatusRepository.create({
        ...exist,
        startDateTime: formatISO(addMinutes(newPeriod.endDate, 1)),
        room: { id: roomId },
      });
      await manager.save(after);
      return;
    }
  }

  private async createRoomStatus(
    roomId: number,
    newPeriod: RoomDatesPeriod,
    newStatus: RoomStatusEnum,
    manager: EntityManager,
  ) {
    const isAvailable = this.getAvailabilityStatuses().includes(newStatus);
    const newRoomStatus = this.roomStatusRepository.create({
      room: { id: roomId },
      startDateTime: newPeriod.startDate,
      endDateTime: newPeriod.endDate,
      status: newStatus,
      isAvailable,
    });
    return await manager.save(newRoomStatus);
  }

  private getAvailabilityStatuses() {
    return [RoomStatusEnum.AVAILABLE_FOR_BOOKING];
  }

  private getUnavailabilityStatuses() {
    return [
      RoomStatusEnum.BOOKED,
      RoomStatusEnum.LONG_STAYING,
      RoomStatusEnum.MAINTENANCE,
      RoomStatusEnum.OUT_OF_ORDER,
      RoomStatusEnum.STAYING,
      RoomStatusEnum.RESERVED,
    ];
  }
}
