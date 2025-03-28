import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { BookingStatusEnum } from './enums/booking-status.enum';
import { BookingRoom } from '../booking-room/booking-room.entity';

@Entity('bookings')
@Index(['userId', 'id'], { unique: true })
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BookingStatusEnum })
  status: BookingStatusEnum;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => BookingRoom, (bookingRoom) => bookingRoom.booking)
  bookingRooms: BookingRoom[];

  @Column({ type: 'timestamp' })
  startDateTime: Date;

  @Column({ type: 'timestamp' })
  endDateTime: Date;

  @Column({ type: 'float', default: 0.0 })
  totalPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
