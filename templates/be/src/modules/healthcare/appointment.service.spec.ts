import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './application/appointment.service';
import { HealthcareModule } from './healthcare.module';
import { InMemoryHealthcareRepository } from './infrastructure/persistence/in-memory-healthcare.repository';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { AppointmentStatus, CancellationActor } from '@repo/contracts';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let repo: InMemoryHealthcareRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HealthcareModule],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    repo = module.get<InMemoryHealthcareRepository>(
      InMemoryHealthcareRepository,
    );
    repo.seed();
    service.setCustomNow(null);
  });

  it('should successfully book a valid appointment in the future', async () => {
    const appointment = await service.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '10:00',
      notes: 'General checkup',
    });

    expect(appointment.id).toBeDefined();
    expect(appointment.status).toBe(AppointmentStatus.CONFIRMED);
    expect(appointment.doctorId).toBe('doc-nguyen-001');
    expect(appointment.date).toBe('2026-09-22');
    expect(appointment.timeSlot).toBe('10:00');
  });

  it('should enforce AC-2: reject concurrent double-booking for the same doctor and slot', async () => {
    const booking1 = service.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '10:00',
    });

    const booking2 = service.bookAppointment({
      patientId: 'pat-002',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '10:00',
    });

    const results = await Promise.allSettled([booking1, booking2]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const rejectedReason = (rejected[0] as PromiseRejectedResult).reason;
    expect(rejectedReason).toBeInstanceOf(ConflictException);
    expect(rejectedReason.message).toContain('SLOT_ALREADY_BOOKED');

    const doctorAppointments =
      await repo.findAppointmentsByDoctorAndDate('doc-nguyen-001', '2026-09-22');
    expect(doctorAppointments.length).toBe(1);
  });

  it('should reject patient schedule conflict when patient books overlapping slots with different doctors', async () => {
    await service.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '09:00 - 09:30',
    });

    await expect(
      service.bookAppointment({
        patientId: 'pat-001',
        doctorId: 'doc-tran-002',
        serviceId: 'srv-cardio-002',
        date: '2026-09-22',
        timeSlot: '09:15 - 09:45',
      }),
    ).rejects.toThrow('PATIENT_SCHEDULE_CONFLICT');
  });

  it('should reject booking in the past due to temporal invariant', async () => {
    await expect(
      service.bookAppointment({
        patientId: 'pat-001',
        doctorId: 'doc-nguyen-001',
        serviceId: 'srv-general-001',
        date: '2020-01-01',
        timeSlot: '10:00',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should mark appointment as CANCELLED and free slot when cancelled >= 2 hours before slot', async () => {
    const booked = await service.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '14:00',
    });

    service.setCustomNow(new Date('2026-09-22T10:00:00'));

    const cancelled = await service.cancelAppointment({
      appointmentId: booked.id,
      reason: 'Schedule change',
      actor: CancellationActor.PATIENT,
    });

    expect(cancelled.status).toBe(AppointmentStatus.CANCELLED);

    const rebooked = await service.bookAppointment({
      patientId: 'pat-002',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '14:00',
    });

    expect(rebooked.id).toBeDefined();
    expect(rebooked.status).toBe(AppointmentStatus.CONFIRMED);
  });

  it('should mark appointment as LATE_CANCELLATION when cancelled < 2 hours before slot', async () => {
    const booked = await service.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '14:00',
    });

    service.setCustomNow(new Date('2026-09-22T13:00:00'));

    const cancelled = await service.cancelAppointment({
      appointmentId: booked.id,
      reason: 'Last minute issue',
      actor: CancellationActor.PATIENT,
    });

    expect(cancelled.status).toBe(AppointmentStatus.LATE_CANCELLATION);
  });

  it('should reject cancelling an already COMPLETED appointment', async () => {
    const booked = await service.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '10:00',
    });

    const appointment = await repo.findAppointmentById(booked.id);
    appointment!.checkIn();
    appointment!.startConsultation();
    appointment!.complete();
    await repo.saveAppointment(appointment!);

    await expect(
      service.cancelAppointment({
        appointmentId: booked.id,
        reason: 'Attempt cancel completed',
        actor: CancellationActor.PATIENT,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should handle reschedule: valid reschedule frees old slot and updates to new slot', async () => {
    const booked = await service.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '09:00',
    });

    const rescheduled = await service.rescheduleAppointment({
      appointmentId: booked.id,
      newDate: '2026-09-22',
      newTimeSlot: '15:00',
      reason: 'Move to afternoon',
    });

    expect(rescheduled.timeSlot).toBe('15:00');

    const rebookedOldSlot = await service.bookAppointment({
      patientId: 'pat-002',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '09:00',
    });
    expect(rebookedOldSlot.id).toBeDefined();
  });

  it('should reject reschedule when appointment is in CHECKED_IN status', async () => {
    const booked = await service.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '09:00',
    });

    const appointment = await repo.findAppointmentById(booked.id);
    appointment!.checkIn();
    await repo.saveAppointment(appointment!);

    await expect(
      service.rescheduleAppointment({
        appointmentId: booked.id,
        newDate: '2026-09-22',
        newTimeSlot: '16:00',
        reason: 'Move while checked in',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
