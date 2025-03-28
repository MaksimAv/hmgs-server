import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BookingService } from './booking.service';
import { BookingCancelReasonEnum } from './enums/booking-cancel-reason.enum';

@Processor('booking')
export class BookingQueueConsumer extends WorkerHost {
  constructor(private readonly bookingService: BookingService) {
    super();
  }

  async process(job: Job<{ bookingId: number }>) {
    const { bookingId } = job.data;
    switch (job.name) {
      case 'confirmation-timeout': {
        const reason = BookingCancelReasonEnum.CONFIRMATION_TIME_EXPIRED;
        return await this.bookingService.cancel(bookingId, reason);
      }
    }
  }
}
