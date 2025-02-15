import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from '../entities/room.entity';
import { CreateRoomDto } from '../dto/create.room.dto';
import { RoomStatusEnum } from '../enums/room.status.enum';
import { RoomVisibilityEnum } from '../enums/room.visibility.enum';

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
      isAvailable: false,
    });

    return await newRoom.save();
  }

  async getOneById(id: number): Promise<Room | null> {
    const room = this.roomRepository.findOne({ where: { id } });
    return room;
  }

  async getMany(): Promise<Room[]> {
    const rooms = this.roomRepository.find();
    return rooms;
  }

  async isExistById(id: number): Promise<boolean> {
    const room = await this.roomRepository.findOne({ where: { id } });
    return Boolean(room);
  }
}
