import { createZodDto } from 'nestjs-zod';
import { RegistrationUserSchema } from 'hmgs-contracts';

export class RegistrationUserDto extends createZodDto(RegistrationUserSchema) {}
