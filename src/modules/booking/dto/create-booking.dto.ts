import { CreateBookingRequestSchema } from 'hmgs-contracts';
import { createZodDto } from 'nestjs-zod';

export class CreateBookingDto extends createZodDto(
  CreateBookingRequestSchema,
) {}
