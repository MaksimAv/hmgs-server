import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RegistrationUserSchema } from 'hmgs-contracts';

export class CreateUserDto extends createZodDto(
  RegistrationUserSchema.omit({ password: true }).extend({
    passwordHash: z.string(),
  }),
) {}
