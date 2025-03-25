import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TokenService } from './modules/token/token.service';
import { AuthTokenPair, AuthUserPayload } from './types/auth';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { UserRoleEnum } from '../user/user-role.enum';

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

  async refresh(user: User): Promise<string> {
    return await this.tokenService.generateAccess(user);
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

  async verifyUser(user: User): Promise<Pick<User, 'isVerified'>> {
    const isVerified = this.checkUserVerify(user);
    if (!isVerified) {
      user.isVerified = true;
      await user.save();
    }
    return { isVerified: user.isVerified };
  }

  private async generateUserTokenPair(
    payload: AuthUserPayload,
  ): Promise<AuthTokenPair> {
    return await this.tokenService.generatePair({
      sub: payload.sub,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
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

  checkUserVerify(user: User): boolean {
    return user.isVerified;
  }
}
