import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { Room } from '../room/room.entity';

@Entity('room_prices')
export class RoomPrice extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  price: number;

  @RelationId((roomPrice: RoomPrice) => roomPrice.room)
  roomId: number;

  @ManyToOne(() => Room)
  room: Room;
}
