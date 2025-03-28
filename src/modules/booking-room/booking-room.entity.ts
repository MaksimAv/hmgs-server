import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
  Column,
} from 'typeorm';
import { Booking } from '../booking/booking.entity';
import { Room } from '../room/room.entity';
import { RoomStatus } from '../room-status/room-status.entity';

@Entity('booking_rooms')
@Index(['room', 'roomStatus'], { unique: true })
export class BookingRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Booking, (booking) => booking.bookingRooms)
  booking: Booking;

  @ManyToOne(() => Room, (room) => room.bookingRooms)
  room: Room;

  @ManyToOne(() => RoomStatus, { onDelete: 'RESTRICT' })
  roomStatus: RoomStatus;

  @Column({ type: 'float', default: 0.0 })
  price: number;
}
