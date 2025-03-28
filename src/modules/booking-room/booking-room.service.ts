import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingRoom } from './booking-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { RoomStatusService } from '../room-status/room-status.service';
import { Booking } from '../booking/booking.entity';
import { Room } from '../room/room.entity';
import { RoomPriceService } from '../room-price/room-price.service';
import { RoomDatesPeriod } from '../room/types/room';
import { RoomService } from '../room/room.service';

@Injectable()
export class BookingRoomService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly roomService: RoomService,
    private readonly roomStatusService: RoomStatusService,
    private readonly roomPriceService: RoomPriceService,

    @InjectRepository(BookingRoom)
    private readonly bookingRoomRepository: Repository<BookingRoom>,
  ) {}

  async create(booking: Booking, rooms: Room[]): Promise<BookingRoom[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    const bookingRoomsToSave: BookingRoom[] = [];
    const bookingPeriod: RoomDatesPeriod = {
      startDate: booking.startDateTime,
      endDate: booking.endDateTime,
    };
    try {
      for (const room of rooms) {
        const roomPrice = await this.roomPriceService.calculatePrice(
          room,
          bookingPeriod,
        );
        const roomStatusReserved = await this.roomStatusService.setReserved(
          room.id,
          bookingPeriod,
          queryRunner,
        );
        bookingRoomsToSave.push(
          this.bookingRoomRepository.create({
            booking: { id: booking.id },
            room: { id: room.id },
            roomStatus: roomStatusReserved,
            price: roomPrice,
          }),
        );
      }
      const bookingRooms = await queryRunner.manager.save(bookingRoomsToSave);
      await queryRunner.commitTransaction();
      return bookingRooms;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async confirm(
    bookingRooms: BookingRoom[],
    manager: EntityManager = this.bookingRoomRepository.manager,
  ): Promise<void> {
    const statuses = bookingRooms.map((i) => i.roomStatus);
    await this.roomStatusService.updateToBooked(statuses, manager);
  }

  async cancel(
    bookingRooms: BookingRoom[],
    manager: EntityManager = this.bookingRoomRepository.manager,
  ): Promise<void> {
    const statuses = bookingRooms.map((i) => i.roomStatus);
    await manager.remove(bookingRooms);
    await this.roomStatusService.updateToAvailable(statuses, manager);
  }

  async getRoomsAvailableForBooking(
    roomIds: number[],
    period: RoomDatesPeriod,
  ) {
    const availableRooms =
      await this.roomService.getManyAvailableByPeriod(period);
    const availableRoomIds = new Set(availableRooms.map((room) => room.id));
    const missingRooms = roomIds.filter((id) => !availableRoomIds.has(id));

    if (missingRooms.length > 0) {
      throw new NotFoundException(
        `Rooms not available for booking: ${missingRooms.join(', ')}`,
      );
    }

    return availableRooms.filter((room) => roomIds.includes(room.id));
  }
}
