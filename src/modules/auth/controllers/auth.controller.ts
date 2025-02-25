import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { JSON_ACCESS_TOKEN } from '../constants/token.constants';
import { ReqUser } from '../../../shared/decorators/req.user.decorator';
import { User } from '../../user/entities/user.entity';
import { LocalGuard } from '../guards/local.guard';
import { RefreshGuard } from '../guards/refresh.guard';
import { RegistrationUserDto } from '../dto/registration.user.dto';
import { CookieManagerService } from '../services/cookie.manager.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieMangerService: CookieManagerService,
    private readonly reflector: Reflector,
  ) {}

  @Post('sign-up')
  async registration(
    @Res({ passthrough: true }) res: Response,
    @Body() body: RegistrationUserDto,
  ) {
    const tokenPair = await this.authService.registration(body);
    const path = this.getPath();
    this.cookieMangerService.setAuthCookie(res, tokenPair.refreshToken, path);
    return { [JSON_ACCESS_TOKEN]: tokenPair.accessToken };
  }

  @Post('sign-in')
  @UseGuards(LocalGuard)
  async login(
    @Res({ passthrough: true }) res: Response,
    @ReqUser() user: User,
  ) {
    const tokenPair = await this.authService.login(user);
    const path = this.getPath();
    this.cookieMangerService.setAuthCookie(res, tokenPair.refreshToken, path);
    return { [JSON_ACCESS_TOKEN]: tokenPair.accessToken };
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @ReqUser() user: User,
  ) {
    const tokenPair = await this.authService.refresh(user);
    const path = this.getPath();
    this.cookieMangerService.setAuthCookie(res, tokenPair.refreshToken, path);
    return { [JSON_ACCESS_TOKEN]: tokenPair.accessToken };
  }

  @Post('sign-out')
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    const path = this.getPath();
    this.cookieMangerService.clearAuthCookie(res, path);
  }

  private getPath() {
    const path = this.reflector.get<string>('path', AuthController);
    const version = this.reflector.get<string>('version', AuthController);
    return version ? `/v${version}/${path}` : `/${path}`;
  }
}
