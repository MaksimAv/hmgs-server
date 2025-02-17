import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Room } from '../../room/entities/room.entity';

@Entity()
export class RoomCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column()
  description: string;

  @OneToMany(() => Room, (room) => room.category)
  room: Room[];
}
