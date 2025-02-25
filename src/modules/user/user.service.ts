import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { UserUniqueValidation } from './types/user';
import { UserRoleEnum } from './enums/user.role.enum';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return user;
  }

  async getUserBySub(sub: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ sub });
    if (!user) throw new NotFoundException();
    return user;
  }

  async getUserByPhone(phone: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ phone });
    if (!user) throw new NotFoundException();
    return user;
  }

  async create(
    data: CreateUserDto,
    role: UserRoleEnum = UserRoleEnum.CUSTOMER,
  ) {
    await this.validateUnique(data);

    const userEntity = this.userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      sub: randomUUID(),
      phone: data.phone,
      password: data.passwordHash,
      email: data.email,
      birthday: data.birthday,
      address: data.address,
      role,
    });

    return await userEntity.save();
  }

  private async validateUnique(data: UserUniqueValidation): Promise<void> {
    const conditions: FindOptionsWhere<User>[] = [{ phone: data.phone }];
    if (data.email) conditions.push({ email: data.email });

    const isExist = await this.userRepository.exists({ where: conditions });
    if (isExist) throw new ConflictException();
  }
}
