import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Protected } from '../../shared/decorators/protected.decorator';
import { ReqUser } from '../../shared/decorators/req-user.decorator';
import { AuthUserPayload } from '../auth/types/auth';

@Controller('user/profile')
@ApiBearerAuth()
@Protected()
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getProfile(@ReqUser() user: AuthUserPayload) {
    const profile = await this.userService.getUserBySub(user.sub);
    return profile;
  }
}
