import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room, RoomVisibilityEnum } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatusEnum } from '../room-status/room-status.enum';
import { RoomDatesPeriod } from './types/room';

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

  async getOneById(id: number): Promise<Room | null> {
    const room = await this.roomRepository.findOne({ where: { id } });
    return room;
  }

  async getMany(): Promise<Room[]> {
    const rooms = await this.roomRepository.find();
    return rooms;
  }

  async getAvailableByPeriod(period: RoomDatesPeriod): Promise<Room[]> {
    const { startDate, endDate } = period;
    const roomQuery = this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomStatus', 'roomStatus')
      .where('room.regularIsAvailable = true');

    const subQuery = roomQuery
      .subQuery()
      .select('rs.id')
      .from('RoomStatus', 'rs')
      .where('rs.roomId = room.id')
      .andWhere('rs.isAvailable = false')
      .andWhere('rs.startDateTime < :endDate')
      .andWhere('rs.endDateTime > :startDate')
      .getQuery();

    roomQuery
      .andWhere(`NOT EXISTS ${subQuery}`)
      .setParameters({ startDate, endDate });

    const rooms = await roomQuery.getMany();
    return rooms;
  }

  async getUnavailableByPeriod(period: RoomDatesPeriod): Promise<Room[]> {
    const { startDate, endDate } = period;
    const roomQuery = this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomStatus', 'roomStatus')
      .where('room.regularIsAvailable = false');

    const subQuery = roomQuery
      .subQuery()
      .select('rs.id')
      .from('RoomStatus', 'rs')
      .where('rs.roomId = room.id')
      .andWhere('rs.isAvailable = true')
      .andWhere('rs.startDateTime < :endDate')
      .andWhere('rs.endDateTime > :startDate')
      .getQuery();

    roomQuery
      .andWhere(`NOT EXISTS ${subQuery}`)
      .setParameters({ startDate, endDate });

    const rooms = await roomQuery.getMany();
    return rooms;
  }

  async isExistById(id: number): Promise<boolean> {
    const room = await this.roomRepository.findOne({ where: { id } });
    return Boolean(room);
  }
}
