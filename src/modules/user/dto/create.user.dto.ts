import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema } from 'hmgs-contracts';

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
