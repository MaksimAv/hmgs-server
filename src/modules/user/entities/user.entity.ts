import { randomUUID } from 'crypto';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, default: randomUUID() })
  sub: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName?: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isDisabled: boolean;

  @Column({ type: 'time with time zone' })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  getFullName(): string {
    return [this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(' ');
  }
}
