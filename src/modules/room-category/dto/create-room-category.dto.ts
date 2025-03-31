import { CreateRoomCategoryRequestSchema } from 'hmgs-contracts';
import { createZodDto } from 'nestjs-zod';

export class CreateRoomCategoryDto extends createZodDto(
  CreateRoomCategoryRequestSchema,
) {}
