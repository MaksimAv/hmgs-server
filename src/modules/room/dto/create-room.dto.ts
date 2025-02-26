import { CreateRoomRequestSchema } from 'hmgs-contracts';
import { createZodDto } from 'nestjs-zod';

export class CreateRoomDto extends createZodDto(CreateRoomRequestSchema) {}
