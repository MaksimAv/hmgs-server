import { CreateRoomRequestSchema } from 'hmgs-contracts';
import { createZodDto } from 'nestjs-zod';

export class CreateRoomRequestDto extends createZodDto(
  CreateRoomRequestSchema,
) {}
