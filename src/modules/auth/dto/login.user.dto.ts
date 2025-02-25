import { createZodDto } from 'nestjs-zod';
import { LoginUserSchema } from 'hmgs-contracts';

export class LoginUserDto extends createZodDto(LoginUserSchema) {}
