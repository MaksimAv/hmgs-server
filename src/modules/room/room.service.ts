import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room, RoomVisibilityEnum } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatusEnum } from '../room-status/room-status.enum';
import { RoomDatesPeriod } from './types/room';
import { RoomStatus } from '../room-status/room-status.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  getRepository(): Repository<Room> {
    return this.roomRepository;
  }

  async create(payload: CreateRoomDto) {
    const newRoom = this.roomRepository.create({
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      capacity: payload.capacity,
      categoryId: payload.categoryId,
      floor: payload.floor,
      size: payload.size,
      cleaningStatus: 'CLEAN',
      minStayDays: payload.minStayDays,
      maxStayDays: payload.maxStayDays,
      visibility: RoomVisibilityEnum.PRIVATE,
      regularPrice: payload.regularPrice,
      currencyCode: payload.currencyCode,
      regularStatus: RoomStatusEnum.OUT_OF_ORDER,
      regularIsAvailable: false,
    });

    return await newRoom.save();
  }

  async getOneById(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) throw new NotFoundException();
    return room;
  }

  // TODO: Create tests for getting rooms funcs by period

  async getManyByPeriod(period: RoomDatesPeriod): Promise<Room[]> {
    return await this.roomRepository.find({
      where: {
        roomStatus: {
          startDateTime: LessThanOrEqual(period.endDate),
          endDateTime: MoreThanOrEqual(period.startDate),
        },
      },
      relations: { roomStatus: true },
    });
  }

  async getManyAvailableByPeriod(period: RoomDatesPeriod): Promise<Room[]> {
    const { startDate, endDate } = period;

    const roomsWithAvailableStatuses = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomStatus', 'roomStatus')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('rs.roomId')
          .from(RoomStatus, 'rs')
          .where('rs.roomId = room.id')
          .andWhere('rs.startDateTime <= :endDate', { endDate })
          .andWhere('rs.endDateTime >= :startDate', { startDate })
          .andWhere('rs.isAvailable = false')
          .getQuery();
        return `NOT EXISTS ${subQuery}`;
      })
      .andWhere('roomStatus.startDateTime <= :endDate', { endDate })
      .andWhere('roomStatus.endDateTime >= :startDate', { startDate })
      .andWhere('roomStatus.isAvailable = true')
      .getMany();

    const roomsWithoutStatuses = await this.roomRepository
      .createQueryBuilder('room')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('rs.roomId')
          .from(RoomStatus, 'rs')
          .where('rs.roomId = room.id')
          .andWhere('rs.startDateTime <= :endDate', { endDate })
          .andWhere('rs.endDateTime >= :startDate', { startDate })
          .getQuery();
        return `NOT EXISTS ${subQuery} AND room.regularIsAvailable = true`;
      })
      .getMany();

    return [...roomsWithAvailableStatuses, ...roomsWithoutStatuses];
  }

  async isExistById(id: number): Promise<boolean> {
    return await this.roomRepository.exists({ where: { id } });
  }
}
