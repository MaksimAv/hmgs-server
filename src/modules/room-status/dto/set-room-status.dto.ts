import { SetRoomStatusSchema } from 'hmgs-contracts';
import { createZodDto } from 'nestjs-zod';

export class SetRoomStatusDto extends createZodDto(SetRoomStatusSchema) {}
