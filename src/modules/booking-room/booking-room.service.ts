import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingRoom } from './booking-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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

  async createBookingRooms(
    booking: Booking,
    rooms: Room[],
  ): Promise<BookingRoom[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    const bookingRoomsToSave: BookingRoom[] = [];
    const bookingPeriod: RoomDatesPeriod = {
      startDate: booking.startDateTime,
      endDate: booking.endDateTime,
    };
    try {
      for (const room of rooms) {
        const roomPrice = await this.roomPriceService.calculateRoomPrice(
          room,
          bookingPeriod,
        );
        const roomBookedStatus =
          await this.roomStatusService.setRoomStatusBooked(
            room.id,
            bookingPeriod,
            queryRunner,
          );
        bookingRoomsToSave.push(
          this.bookingRoomRepository.create({
            booking: { id: booking.id },
            room: { id: room.id },
            roomStatus: roomBookedStatus,
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

  async getRoomsAvailableForBooking(
    roomIds: number[],
    period: RoomDatesPeriod,
  ) {
    const availableRooms = await this.roomService.getAvailableByPeriod(period);
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
