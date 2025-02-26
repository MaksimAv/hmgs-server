import { SetRoomPriceSchema } from 'hmgs-contracts';
import { createZodDto } from 'nestjs-zod';

export class SetRoomPriceDto extends createZodDto(SetRoomPriceSchema) {}
