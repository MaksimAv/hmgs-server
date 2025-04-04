import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JSON_ACCESS_TOKEN } from './auth.api.constants';
import { ReqUser } from '../../shared/decorators/req-user.decorator';
import { User } from '../user/user.entity';
import { LocalGuard } from './guards/local.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { CookieManagerService } from './modules/cookie-manager/cookie-manager.service';
import { AuthUserPayload } from './types/auth';
import { ApiBearerAuth, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { Protected } from '../../shared/decorators/protected.decorator';
import { ReqUserPayload } from '../../shared/decorators/req-user-payload.decorator';

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
  @ApiBody({ type: LoginUserDto })
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
  @ApiCookieAuth()
  @UseGuards(RefreshGuard)
  async refresh(@ReqUser() user: User) {
    const accessToken = await this.authService.refresh(user);
    return { [JSON_ACCESS_TOKEN]: accessToken };
  }

  @Post('sign-out')
  @ApiCookieAuth()
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    const path = this.getPath();
    this.cookieMangerService.clearAuthCookie(res, path);
  }

  @Post('verify')
  @ApiBearerAuth()
  @Protected()
  async verify(@ReqUser() user: User) {
    return await this.authService.verifyUser(user);
  }

  @Get('payload')
  @ApiBearerAuth()
  @Protected('payload')
  getPayload(@ReqUserPayload() payload: AuthUserPayload) {
    return payload;
  }

  private getPath() {
    const path = this.reflector.get<string>('path', AuthController);
    const version = this.reflector.get<string>('version', AuthController);
    return version ? `/v${version}/${path}` : `/${path}`;
  }
}
