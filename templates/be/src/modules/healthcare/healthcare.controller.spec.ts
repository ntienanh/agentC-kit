import { Test, TestingModule } from '@nestjs/testing';
import { HealthcareController } from './presentation/healthcare.controller';
import { HealthcareModule } from './healthcare.module';
import { InMemoryHealthcareRepository } from './infrastructure/persistence/in-memory-healthcare.repository';
import { AppointmentStatus, PaymentMethod, PaymentStatus, QueueStatus } from '@repo/contracts';

describe('HealthcareController Integration', () => {
  let controller: HealthcareController;
  let repo: InMemoryHealthcareRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HealthcareModule],
    }).compile();

    controller = module.get<HealthcareController>(HealthcareController);
    repo = module.get<InMemoryHealthcareRepository>(
      InMemoryHealthcareRepository,
    );
    repo.seed();
  });

  it('should verify catalog endpoints: doctors, services, rooms, availability', async () => {
    const doctors = await controller.findAllDoctors();
    expect(doctors.length).toBeGreaterThanOrEqual(2);
    expect(doctors.some((d) => d.fullName === 'Dr. Nguyen')).toBe(true);

    const services = await controller.findAllServices();
    expect(services.length).toBeGreaterThanOrEqual(2);

    const rooms = await controller.findAllRooms();
    expect(rooms.length).toBeGreaterThanOrEqual(2);

    const availability = await controller.getAvailableSlots({
      doctorId: 'doc-nguyen-001',
      date: '2026-09-22',
      serviceId: 'srv-general-001',
    });
    expect(availability.slots.length).toBeGreaterThan(0);
    expect(availability.slots).toContain('09:00');
    expect(availability.slots).toContain('14:00');
    expect(availability.slots).not.toContain('12:00');
    expect(availability.slots).not.toContain('12:30');
  });

  it('should run full healthcare lifecycle via controller: book -> checkin -> call -> consult -> pay -> dashboard', async () => {
    const appointment = await controller.bookAppointment({
      patientId: 'pat-lifecycle-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '09:30',
      notes: 'Controller lifecycle test',
    });
    expect(appointment.id).toBeDefined();
    expect(appointment.status).toBe(AppointmentStatus.CONFIRMED);

    const foundAppt = await controller.findAppointmentById(appointment.id);
    expect(foundAppt.id).toBe(appointment.id);

    const ticket = await controller.checkIn({
      appointmentId: appointment.id,
      receptionistId: 'rec-001',
    });
    expect(ticket.queueNumber).toBe(1);
    expect(ticket.status).toBe(QueueStatus.WAITING);

    const called = await controller.callNext({
      ticketId: ticket.id,
      doctorId: 'doc-nguyen-001',
      roomId: 'Room 101',
    });
    expect(called.status).toBe(QueueStatus.CALLED);

    const consultation = await controller.completeConsultation({
      appointmentId: appointment.id,
      doctorId: 'doc-nguyen-001',
      chiefComplaint: 'Ho sốt',
      symptoms: 'Mệt mỏi, đau họng',
      vitals: {
        bloodPressure: '120/80',
        heartRate: 78,
        temperature: 37.5,
        weight: 65,
        height: 170,
      },
      diagnosis: 'Cảm cúm thông thường',
      treatmentPlan: 'Uống nhiều nước, nghỉ ngơi',
      prescriptionItems: [
        {
          medicine: 'Vitamin C 500mg',
          dosage: '1 viên',
          frequency: '1 lần / ngày',
          duration: '5 ngày',
          instructions: 'Uống buổi sáng',
        },
      ],
    });
    expect(consultation.isLocked).toBe(true);
    expect(consultation.diagnosis).toBe('Cảm cúm thông thường');

    const payment = await controller.processPayment({
      appointmentId: appointment.id,
      amount: 300000,
      method: PaymentMethod.CASH,
      transactionRef: 'TX-CASH-001',
    });
    expect(payment.status).toBe(PaymentStatus.PAID);
    expect(payment.amount).toBe(300000);

    const metrics = await controller.getDashboardMetrics('2026-09-22');
    expect(metrics.totalAppointments).toBe(1);
    expect(metrics.completed).toBe(1);
    expect(metrics.totalRevenue).toBe(300000);
  });
});
