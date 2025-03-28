import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsRelations, Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { BookingRoomService } from '../booking-room/booking-room.service';
import { BookingStatusEnum } from './enums/booking-status.enum';
import { User } from '../user/user.entity';
import { AuthService } from '../auth/auth.service';
import { BookingRoom } from '../booking-room/booking-room.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingCancelReasonEnum } from './enums/booking-cancel-reason.enum';

@Injectable()
export class BookingService {
  constructor(
    private readonly authService: AuthService,
    private readonly bookingRoomsService: BookingRoomService,

    @InjectQueue('booking')
    private readonly bookingQueue: Queue,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async getOneByUser(
    user: Pick<User, 'id'>,
    bookingId: number,
    options: { relations?: FindOptionsRelations<Booking> } = {},
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { userId: user.id, id: bookingId },
      relations: options?.relations,
    });
    if (!booking) throw new NotFoundException();
    return booking;
  }

  async getOneById(
    bookingId: number,
    options: { relations?: FindOptionsRelations<Booking> } = {},
  ) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: options?.relations,
    });
    if (!booking) throw new NotFoundException();
    return booking;
  }

  async create(user: User, data: CreateBookingDto) {
    // TODO: check is room settings allow creating this booking
    const rooms = await this.bookingRoomsService.getRoomsAvailableForBooking(
      data.roomIds,
      { startDate: data.startDate, endDate: data.endDate },
    );
    const newBooking = await this.saveNew(user, data);
    await this.bookingRoomsService.create(newBooking, rooms);
    await this.addConfirmationTimeout(newBooking, newBooking.expiresAt);
    return newBooking;
  }

  async confirm(
    user: User,
    booking: Booking,
    bookingRooms: BookingRoom[],
  ): Promise<boolean> {
    const isUserVerify = this.authService.checkUserVerify(user);
    if (!isUserVerify) throw new ForbiddenException('User is not verified');
    if (bookingRooms.length === 0) {
      throw new BadRequestException('Nothing to confirm');
    }
    await this.bookingRepository.manager.transaction(async (manager) => {
      await this.cleanExpiration(booking, manager);
      await this.updateStatus(booking, BookingStatusEnum.CONFIRMED, manager);
      await this.bookingRoomsService.confirm(booking.bookingRooms, manager);
    });
    return true;
  }

  async cancel(
    bookingId: number,
    reason: BookingCancelReasonEnum,
  ): Promise<string> {
    const booking = await this.getOneById(bookingId, {
      relations: { bookingRooms: { roomStatus: true } },
    });
    switch (reason) {
      case BookingCancelReasonEnum.CONFIRMATION_TIME_EXPIRED: {
        if (booking.status === BookingStatusEnum.CREATED) {
          const timeoutStatus = BookingStatusEnum.CONFIRMATION_TIMEOUT;
          const bookingRooms = booking.bookingRooms;
          return await this.bookingRepository.manager.transaction(
            async (manager) => {
              await this.bookingRoomsService.cancel(bookingRooms, manager);
              await this.updateStatus(booking, timeoutStatus, manager);
              return 'no confirmation received. cancel';
            },
          );
        }
        return 'confirmation received. not cancelled';
      }
      default: {
        return 'unknown cancellation reason';
      }
    }
  }

  async addConfirmationTimeout(booking: Booking, expiresAt: Date) {
    const currentTime = Date.now();
    const delay = expiresAt.getTime() - currentTime;
    await this.bookingQueue.add(
      'confirmation-timeout',
      { bookingId: booking.id },
      { delay, attempts: 3 },
    );
  }

  async updateStatus(
    booking: Booking,
    newStatus: BookingStatusEnum,
    manager: EntityManager = this.bookingRepository.manager,
  ): Promise<Booking> {
    return await manager.save(Booking, { ...booking, status: newStatus });
  }

  private async cleanExpiration(
    booking: Booking,
    manager: EntityManager = this.bookingRepository.manager,
  ) {
    return await manager.save(Booking, { ...booking, expiresAt: null });
  }

  private async saveNew(
    user: User,
    data: CreateBookingDto,
    manager: EntityManager = this.bookingRepository.manager,
  ): Promise<Booking & { expiresAt: Date }> {
    const status = BookingStatusEnum.CREATED;
    const expirationTime = this.getConfirmationExpirationTimeMs();
    const expiresAt = new Date(Date.now() + expirationTime);
    return await manager.save(Booking, {
      user: { id: user.id },
      startDateTime: data.startDate,
      endDateTime: data.endDate,
      status,
      expiresAt,
    });
  }

  private getConfirmationExpirationTimeMs() {
    return 1 * 60 * 1000;
  }
}
