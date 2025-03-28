import { Module } from '@nestjs/common';
import { CORE_LAYER } from './core.layer';
import { BookingModule } from './modules/booking/booking.module';
import { BookingQueueConsumer } from './modules/booking/booking-queue.consumer';

@Module({
  imports: [...CORE_LAYER, BookingModule],
  providers: [BookingQueueConsumer],
})
export class WorkerModule {}
