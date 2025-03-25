import { Body, Controller, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Protected } from '../../shared/decorators/protected.decorator';
import { ReqUser } from '../../shared/decorators/req-user.decorator';
import { UserService } from '../user/user.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly userService: UserService,
  ) {}

  @Post('create')
  @ApiBearerAuth()
  @Protected()
  async create(
    @ReqUser('sub') userSub: string,
    @Body() body: CreateBookingDto,
  ) {
    const user = await this.userService.getUserBySub(userSub);
    return await this.bookingService.create(user, body);
  }
}
