import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoomCategory } from '../room-category/room-category.entity';
import { RoomPrice } from '../room-price/room-price.entity';
import { RoomStatus } from '../room-status/room-status.entity';
import { RoomStatusEnum } from '../room-status/room-status.enum';

// TODO: RoomAmenity - included in the price, for example: wifi, pool, air conditioning.
// TODO: RoomFeatures - things that can be purchased for a some price, such as breakfast, bathhouse

export enum RoomVisibilityEnum {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

@Entity('rooms')
export class Room extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  capacity: number;

  @Column()
  cleaningStatus: string;

  @Column()
  visibility: string;

  @Column()
  currencyCode: string;

  @Column({ type: 'float', default: 0.0 })
  size: number;

  @Column({ type: 'int', nullable: true })
  floor: number;

  @Column({ type: 'int', default: 0 })
  minStayDays: number;

  @Column({ type: 'int', default: 90 })
  maxStayDays: number;

  @Column()
  categoryId: number;

  @ManyToOne(() => RoomCategory)
  @JoinColumn({ name: 'categoryId' })
  category: RoomCategory;

  @Column({ type: 'float', default: 0.0 })
  regularPrice: number;

  @OneToMany(() => RoomPrice, (roomPrice) => roomPrice.room, { nullable: true })
  roomPrice: RoomPrice[];

  @Column({ type: 'boolean', default: false })
  regularIsAvailable: boolean;

  @Column({
    type: 'enum',
    enum: RoomStatusEnum,
    default: RoomStatusEnum.OUT_OF_ORDER,
  })
  regularStatus: RoomStatusEnum;

  @OneToMany(() => RoomStatus, (roomStatus) => roomStatus.room)
  roomStatus: RoomStatus[];
}
