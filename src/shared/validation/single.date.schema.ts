import { z } from 'zod';
import { isValid, parseISO } from 'date-fns';

export const singleDateSchema = z
  .string()
  .transform((value) => parseISO(value))
  .refine((val) => isValid(val), { message: 'Wrong date format' });
