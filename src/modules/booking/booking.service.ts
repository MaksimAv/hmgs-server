import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { BookingRoomService } from '../booking-room/booking-room.service';
import { BookingStatus } from './booking-status.enum';
import { RoomDatesPeriod } from '../room/types/room';
import { User } from '../user/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    private readonly bookingRoomService: BookingRoomService,
  ) {}

  async create(user: User, data: CreateBookingDto) {
    // create booking and reserved status for the specified date
    // check is room settings allow creating this booking
    // try confirm booking
    const bookingPeriod: RoomDatesPeriod = {
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    };
    const rooms = await this.bookingRoomService.getRoomsAvailableForBooking(
      data.roomIds,
      bookingPeriod,
    );
    const newBooking = await this.bookingRepository.save({
      user: { id: user.id },
      startDateTime: bookingPeriod.startDate,
      endDateTime: bookingPeriod.endDate,
      status: BookingStatus.CREATED,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    await this.bookingRoomService.createBookingRooms(newBooking, rooms);
  }

  async confirm(user: User, bookingId: number) {
    // check is booking belongs to the user
    // check is user phone number verify
    // | true - continue booking process
    // | false - request confirmation, rooms is reserved about 10 minutes
  }

  async cancel(bookingId, reason: any) {
    // create reason types (by user, by expires ...)
    // if booking is not confirmed yet - cancel there
  }

  async isBookingsRefersToUser(user: User, bookingIds: number[]) {
    const bookings = await this.bookingRepository.find({
      where: { userId: user.id, id: In(bookingIds) },
    });
    if (bookings.length !== bookingIds.length) return false;
    return true;
  }
}
