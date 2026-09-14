import { Injectable } from '@nestjs/common';
import { InMemoryHealthcareRepository } from '../infrastructure/persistence/in-memory-healthcare.repository';
import {
  AppointmentStatus,
  ClinicDashboardMetricsDto,
  PaymentStatus,
  QueueStatus,
} from '@repo/contracts';

@Injectable()
export class ClinicDashboardService {
  constructor(private readonly repo: InMemoryHealthcareRepository) {}

  async getMetrics(date: string): Promise<ClinicDashboardMetricsDto> {
    const appointments = await this.repo.findAppointmentsByDate(date);
    const tickets = await this.repo.findQueueTicketsByDate(date);
    const payments = await this.repo.findPayments();

    const totalAppointments = appointments.length;
    const checkedIn = appointments.filter(
      (a) => a.status === AppointmentStatus.CHECKED_IN,
    ).length;
    const inConsultation = appointments.filter(
      (a) => a.status === AppointmentStatus.IN_CONSULTATION,
    ).length;
    const completed = appointments.filter(
      (a) => a.status === AppointmentStatus.COMPLETED,
    ).length;
    const cancelled = appointments.filter(
      (a) =>
        a.status === AppointmentStatus.CANCELLED ||
        a.status === AppointmentStatus.LATE_CANCELLATION,
    ).length;
    const noShow = appointments.filter(
      (a) => a.status === AppointmentStatus.NO_SHOW,
    ).length;

    const waiting =
      tickets.filter((t) => t.status === QueueStatus.WAITING).length ||
      appointments.filter((a) => a.status === AppointmentStatus.CHECKED_IN)
        .length;

    const appointmentIdsOnDate = new Set(appointments.map((a) => a.id));
    const totalRevenue = payments
      .filter(
        (p) =>
          appointmentIdsOnDate.has(p.appointmentId) &&
          p.status === PaymentStatus.PAID,
      )
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      date,
      totalAppointments,
      checkedIn,
      waiting,
      inConsultation,
      completed,
      cancelled,
      noShow,
      totalRevenue,
    };
  }
}
