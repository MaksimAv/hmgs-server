import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  RelationId,
  JoinColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { RoomStatusEnum } from '../enums/room.status.enum';

@Entity()
export class RoomStatus extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp with time zone' })
  startDateTime: Date;

  @Column({ type: 'timestamp with time zone' })
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
