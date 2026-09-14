import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './application/queue.service';
import { AppointmentService } from './application/appointment.service';
import { HealthcareModule } from './healthcare.module';
import { InMemoryHealthcareRepository } from './infrastructure/persistence/in-memory-healthcare.repository';
import { AppointmentStatus, QueueStatus } from '@repo/contracts';

describe('QueueService', () => {
  let queueService: QueueService;
  let appointmentService: AppointmentService;
  let repo: InMemoryHealthcareRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HealthcareModule],
    }).compile();

    queueService = module.get<QueueService>(QueueService);
    appointmentService = module.get<AppointmentService>(AppointmentService);
    repo = module.get<InMemoryHealthcareRepository>(
      InMemoryHealthcareRepository,
    );
    repo.seed();
  });

  it('should successfully check-in patient, increment queue numbers sequentially, and create waiting tickets', async () => {
    const appt1 = await appointmentService.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '09:00',
    });

    const appt2 = await appointmentService.bookAppointment({
      patientId: 'pat-002',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '09:30',
    });

    const ticket1 = await queueService.checkIn({
      appointmentId: appt1.id,
      receptionistId: 'rec-001',
    });

    expect(ticket1.queueNumber).toBe(1);
    expect(ticket1.status).toBe(QueueStatus.WAITING);
    expect(ticket1.appointmentId).toBe(appt1.id);

    const updatedAppt1 = await repo.findAppointmentById(appt1.id);
    expect(updatedAppt1!.status).toBe(AppointmentStatus.CHECKED_IN);

    const ticket2 = await queueService.checkIn({
      appointmentId: appt2.id,
      receptionistId: 'rec-001',
    });

    expect(ticket2.queueNumber).toBe(2);
    expect(ticket2.status).toBe(QueueStatus.WAITING);
  });

  it('should call next patient and assign room', async () => {
    const appt = await appointmentService.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '10:00',
    });

    const ticket = await queueService.checkIn({
      appointmentId: appt.id,
      receptionistId: 'rec-001',
    });

    const called = await queueService.callNext({
      ticketId: ticket.id,
      doctorId: 'doc-nguyen-001',
      roomId: 'Room 101',
    });

    expect(called.status).toBe(QueueStatus.CALLED);

    const updatedAppt = await repo.findAppointmentById(appt.id);
    expect(updatedAppt!.roomId).toBe('Room 101');
  });

  it('should start consultation and transition statuses to IN_CONSULTATION', async () => {
    const appt = await appointmentService.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '10:30',
    });

    const ticket = await queueService.checkIn({
      appointmentId: appt.id,
      receptionistId: 'rec-001',
    });

    await queueService.callNext({
      ticketId: ticket.id,
      doctorId: 'doc-nguyen-001',
      roomId: 'Room 101',
    });

    const inConsultationTicket = await queueService.startConsultation(
      ticket.id,
    );
    expect(inConsultationTicket.status).toBe(QueueStatus.IN_CONSULTATION);

    const updatedAppt = await repo.findAppointmentById(appt.id);
    expect(updatedAppt!.status).toBe(AppointmentStatus.IN_CONSULTATION);
  });

  it('should skip a queue ticket', async () => {
    const appt = await appointmentService.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '11:00',
    });

    const ticket = await queueService.checkIn({
      appointmentId: appt.id,
      receptionistId: 'rec-001',
    });

    const skipped = await queueService.skip(ticket.id);
    expect(skipped.status).toBe(QueueStatus.SKIPPED);
  });
});
