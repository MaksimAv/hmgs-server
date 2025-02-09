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
  status: string;

  @Column()
  currencyCode: string;

  @Column()
  capacity: string;

  @Column()
  visibility: string;

  @Column({ type: 'float', nullable: false, default: 0.0 })
  regularPrice: number;

  @Column()
  categoryId: number;

  @OneToMany(() => RoomPrice, (roomPrice) => roomPrice.room, { nullable: true })
  roomPrice: RoomPrice[];

  @ManyToOne(() => RoomCategory)
  @JoinColumn({ name: 'categoryId' })
  category: string;
}
