import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { BookingStatus } from './booking-status.enum';
import { BookingRoom } from '../booking-room/booking-room.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BookingStatus })
  status: BookingStatus;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => BookingRoom, (bookingRoom) => bookingRoom.booking)
  bookingRooms: BookingRoom[];

  @Column({ type: 'timestamp with time zone' })
  startDateTime: Date;

  @Column({ type: 'timestamp with time zone' })
  endDateTime: Date;

  @Column({ type: 'float', default: 0.0 })
  totalPrice: number;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
