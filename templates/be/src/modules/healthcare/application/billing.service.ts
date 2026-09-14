import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InMemoryHealthcareRepository } from '../infrastructure/persistence/in-memory-healthcare.repository';
import { PaymentRecordEntity } from '../domain/payment-record.entity';
import {
  PaymentRecordDto,
  PaymentStatus,
  ProcessPaymentDto,
} from '@repo/contracts';

@Injectable()
export class BillingService {
  constructor(private readonly repo: InMemoryHealthcareRepository) {}

  async processPayment(
    dto: ProcessPaymentDto,
  ): Promise<PaymentRecordDto> {
    const appointment = await this.repo.findAppointmentById(
      dto.appointmentId,
    );
    if (!appointment) {
      throw new NotFoundException(
        `Appointment ${dto.appointmentId} not found`,
      );
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    let payment = await this.repo.findPaymentByAppointmentId(
      dto.appointmentId,
    );
    if (!payment) {
      payment = new PaymentRecordEntity({
        appointmentId: dto.appointmentId,
        amount: dto.amount,
        method: dto.method,
        status: PaymentStatus.PAID,
        transactionRef: dto.transactionRef,
      });
    } else {
      payment.markPaid(dto.transactionRef);
    }

    const saved = await this.repo.savePayment(payment);
    return saved.toDto();
  }

  async getPaymentByAppointmentId(
    appointmentId: string,
  ): Promise<PaymentRecordDto> {
    const payment = await this.repo.findPaymentByAppointmentId(
      appointmentId,
    );
    if (!payment) {
      throw new NotFoundException(
        `Payment for appointment ${appointmentId} not found`,
      );
    }
    return payment.toDto();
  }
}
