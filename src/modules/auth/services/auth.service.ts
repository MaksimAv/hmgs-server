import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TokenService } from './token.service';
import { AuthTokenPair, AuthUserPayload } from '../types/auth';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { RegistrationUserDto } from '../dto/registration.user.dto';
import { UserRoleEnum } from '../../user/enums/user.role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async registration(
    data: RegistrationUserDto,
    role: UserRoleEnum = UserRoleEnum.CUSTOMER,
  ): Promise<AuthTokenPair> {
    const { password, ...userData } = data;
    const passwordHash = await this.generateHashPassword(password);
    const newUser = { ...userData, passwordHash };
    const user = await this.userService.create(newUser, role);
    return await this.generateUserTokenPair(user);
  }

  async login(user: User): Promise<AuthTokenPair> {
    return await this.generateUserTokenPair(user);
  }

  async refresh(user: User): Promise<AuthTokenPair> {
    return await this.generateUserTokenPair(user);
  }

  async getUserBySub(sub: string): Promise<User> {
    try {
      return await this.userService.getUserBySub(sub);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async validateUserCredentials(
    login: string,
    password: string,
  ): Promise<User> {
    try {
      const phone = login;
      const user = await this.userService.getUserByPhone(phone);
      await this.validatePassword(password, user.password);
      return user;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async generateUserTokenPair(user: User): Promise<AuthTokenPair> {
    const payload: AuthUserPayload = {
      sub: user.sub,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const pair = await this.tokenService.generatePair(payload);
    return pair;
  }

  private async validatePassword(
    password: string,
    encrypted: string,
  ): Promise<void> {
    const isEqual = await bcrypt.compare(password, encrypted);
    if (!isEqual) throw new UnauthorizedException();
  }

  private async generateHashPassword(password: string): Promise<string> {
    const salt = 10;
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }
}
