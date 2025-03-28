import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  RelationId,
  JoinColumn,
} from 'typeorm';
import { Room } from '../room/room.entity';
import { RoomStatusEnum } from './room-status.enum';

@Entity('room_statuses')
export class RoomStatus extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  startDateTime: Date;

  @Column({ type: 'timestamp' })
  endDateTime: Date;

  @Column({
    type: 'enum',
    enum: RoomStatusEnum,
    default: RoomStatusEnum.OUT_OF_ORDER,
  })
  status: RoomStatusEnum;

  @Column({ type: 'boolean', default: false })
  isAvailable: boolean;

  @RelationId((roomStatus: RoomStatus) => roomStatus.room)
  roomId: number;

  @ManyToOne(() => Room, (room) => room.roomStatus)
  @JoinColumn({ name: 'roomId' })
  room: Room;
}
