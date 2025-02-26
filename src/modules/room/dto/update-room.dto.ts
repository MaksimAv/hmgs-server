import { UpdateRoomRequestSchema } from 'hmgs-contracts';
import { createZodDto } from 'nestjs-zod';

export class UpdateRoomDto extends createZodDto(UpdateRoomRequestSchema) {}
