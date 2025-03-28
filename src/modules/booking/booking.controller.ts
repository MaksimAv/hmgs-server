import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Protected } from '../../shared/decorators/protected.decorator';
import { ReqUser } from '../../shared/decorators/req-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../user/user.entity';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiBearerAuth()
  @Protected()
  async create(@ReqUser() user: User, @Body() body: CreateBookingDto) {
    return await this.bookingService.create(user, body);
  }

  @Post(':id/confirm')
  @ApiBearerAuth()
  @Protected()
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirm(@ReqUser() user: User, @Param('id') bookingId: number) {
    const booking = await this.bookingService.getOneByUser(user, bookingId, {
      relations: { bookingRooms: { roomStatus: true } },
    });
    const bookingRooms = booking.bookingRooms;
    return await this.bookingService.confirm(user, booking, bookingRooms);
  }
}
