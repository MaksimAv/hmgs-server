import { createZodDto } from 'nestjs-zod';
import { UpdateUserSchema } from 'hmgs-contracts';

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
