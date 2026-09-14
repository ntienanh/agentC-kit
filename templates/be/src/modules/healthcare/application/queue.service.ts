import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InMemoryHealthcareRepository } from '../infrastructure/persistence/in-memory-healthcare.repository';
import { QueueTicketEntity } from '../domain/queue-ticket.entity';
import {
  AppointmentStatus,
  CheckInAppointmentDto,
  CallQueueTicketDto,
  QueueStatus,
  QueueTicketDto,
} from '@repo/contracts';

@Injectable()
export class QueueService {
  constructor(private readonly repo: InMemoryHealthcareRepository) {}

  async checkIn(dto: CheckInAppointmentDto): Promise<QueueTicketDto> {
    const appointment = await this.repo.findAppointmentById(dto.appointmentId);
    if (!appointment) {
      throw new NotFoundException(`Appointment ${dto.appointmentId} not found`);
    }
    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.BOOKED
    ) {
      throw new BadRequestException(
        `Cannot check in appointment with status ${appointment.status}`,
      );
    }

    appointment.checkIn();
    await this.repo.saveAppointment(appointment);

    const doctor = await this.repo.findDoctorById(appointment.doctorId);
    const doctorName = doctor ? doctor.fullName : 'Doctor';

    const queueNumber = await this.repo.getNextQueueNumber(appointment.date);

    const ticket = new QueueTicketEntity({
      queueNumber,
      appointmentId: appointment.id,
      patientName: `Patient ${appointment.patientId}`,
      doctorName,
      status: QueueStatus.WAITING,
      estimatedTime: appointment.timeSlot,
      date: appointment.date,
    });

    const saved = await this.repo.saveQueueTicket(ticket);
    return saved.toDto();
  }

  async callNext(dto: CallQueueTicketDto): Promise<QueueTicketDto> {
    const ticket = await this.repo.findQueueTicketById(dto.ticketId);
    if (!ticket) {
      throw new NotFoundException(`Queue ticket ${dto.ticketId} not found`);
    }
    ticket.call();
    await this.repo.saveQueueTicket(ticket);

    const appointment = await this.repo.findAppointmentById(
      ticket.appointmentId,
    );
    if (appointment && dto.roomId) {
      appointment.setRoomId(dto.roomId);
      await this.repo.saveAppointment(appointment);
    }

    return ticket.toDto();
  }

  async startConsultation(ticketId: string): Promise<QueueTicketDto> {
    const ticket = await this.repo.findQueueTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Queue ticket ${ticketId} not found`);
    }
    ticket.startConsultation();
    await this.repo.saveQueueTicket(ticket);

    const appointment = await this.repo.findAppointmentById(
      ticket.appointmentId,
    );
    if (appointment) {
      appointment.startConsultation();
      await this.repo.saveAppointment(appointment);
    }

    return ticket.toDto();
  }

  async skip(ticketId: string): Promise<QueueTicketDto> {
    const ticket = await this.repo.findQueueTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Queue ticket ${ticketId} not found`);
    }
    ticket.skip();
    await this.repo.saveQueueTicket(ticket);
    return ticket.toDto();
  }

  async getDailyQueue(date: string): Promise<QueueTicketDto[]> {
    const tickets = await this.repo.findQueueTicketsByDate(date);
    return tickets.map((t) => t.toDto());
  }
}
