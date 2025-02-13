import { UpdateRoomRequestSchema } from 'hmgs-contracts';
import { createZodDto } from 'nestjs-zod';

export class UpdateRoomRequestDto extends createZodDto(
  UpdateRoomRequestSchema,
) {}
