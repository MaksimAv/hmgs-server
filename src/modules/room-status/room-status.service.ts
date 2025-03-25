import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
} from 'typeorm';
import { RoomStatus } from './room-status.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomDatesPeriod } from '../room/types/room';
import { RoomStatusEnum } from './room-status.enum';
import { addMinutes, formatISO, isAfter, isBefore, subMinutes } from 'date-fns';
import { RoomService } from '../room/room.service';

@Injectable()
export class RoomStatusService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly roomService: RoomService,

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

    room.regularIsAvailable = availabilityStatuses.includes(status);
    room.regularStatus = status;

    await room.save();
    return true;
  }

  async getByPeriod(
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

  async set(
    roomId: number,
    period: RoomDatesPeriod,
    status: RoomStatusEnum,
    externalQueryRunner?: QueryRunner,
  ): Promise<RoomStatus> {
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
      const newStatus = await this.saveNew(roomId, period, status, manager);
      await queryRunner.commitTransaction();
      return newStatus;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      if (!externalQueryRunner) await queryRunner.release();
    }
  }

  async setReserved(
    roomId: number,
    period: RoomDatesPeriod,
    queryRunner: QueryRunner,
  ): Promise<RoomStatus> {
    return await this.set(roomId, period, RoomStatusEnum.RESERVED, queryRunner);
  }

  async update(
    roomStatuses: RoomStatus[],
    newStatus: RoomStatusEnum,
    manager: EntityManager = this.roomStatusRepository.manager,
  ) {
    for (const roomStatus of roomStatuses) roomStatus.status = newStatus;
    return await manager.save(roomStatuses);
  }

  async updateToBooked(roomStatuses: RoomStatus[], manager: EntityManager) {
    return await this.update(roomStatuses, RoomStatusEnum.BOOKED, manager);
  }

  private async getOverlaps(
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

  private async splitOverlaps(
    existingStatuses: RoomStatus[],
    newPeriod: RoomDatesPeriod,
    manager: EntityManager,
  ): Promise<void> {
    for (const exist of existingStatuses) {
      const roomId = exist.roomId;

      await manager.remove(exist);

      // existStartDateTime > newStartDateTime and
      // existEndDateTime < newEndDateTime
      const isFullOverlap =
        isAfter(exist.startDateTime, newPeriod.startDate) &&
        isBefore(exist.endDateTime, newPeriod.endDate);

      if (!isFullOverlap) {
        const newEntries: RoomStatus[] = [];
        // existStartDateTime < newStartDateTime
        if (isBefore(exist.startDateTime, newPeriod.startDate)) {
          const before = this.roomStatusRepository.create({
            ...exist,
            endDateTime: formatISO(subMinutes(newPeriod.startDate, 1)),
            room: { id: roomId },
          });
          newEntries.push(before);
        }
        // existStartDateTime > newEndDateTime
        if (isAfter(exist.endDateTime, newPeriod.endDate)) {
          const after = this.roomStatusRepository.create({
            ...exist,
            startDateTime: formatISO(addMinutes(newPeriod.endDate, 1)),
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
      RoomStatusEnum.MAINTENANCE,
      RoomStatusEnum.OUT_OF_ORDER,
      RoomStatusEnum.RESERVED,
    ];
  }
}
