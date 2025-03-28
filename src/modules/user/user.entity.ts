import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRoleEnum } from './user-role.enum';
import { Booking } from '../booking/booking.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sub: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName?: string;

  @Column({ unique: true })
  phone: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.CUSTOMER })
  role: UserRoleEnum;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLogin: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  disabledAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.user, { nullable: true })
  bookings?: Booking[];

  getFullName(): string {
    return [this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(' ');
  }
}
