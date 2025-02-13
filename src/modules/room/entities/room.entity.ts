import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoomPrice } from './room.price.entity';
import { RoomCategory } from './room.category.entity';

// TODO: RoomAmenity - included in the price, for example: wifi, pool, air conditioning.
// TODO: RoomFeatures - things that can be purchased for a some price, such as breakfast, bathhouse

@Entity()
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
  status: string;

  @Column()
  cleaningStatus: string;

  @Column()
  visibility: string;

  @Column()
  currencyCode: string;

  @Column({ type: 'float', nullable: false, default: 0.0 })
  regularPrice: number;

  @Column({ type: 'float', nullable: false, default: 0.0 })
  size: number;

  @Column({ type: 'int', nullable: true })
  floor: number;

  @Column()
  categoryId: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  minStayDays: number;

  @Column({ type: 'int', nullable: false, default: 90 })
  maxStayDays: number;

  @ManyToOne(() => RoomCategory)
  @JoinColumn({ name: 'categoryId' })
  category: string;

  @OneToMany(() => RoomPrice, (roomPrice) => roomPrice.room, { nullable: true })
  roomPrice: RoomPrice[];
}
