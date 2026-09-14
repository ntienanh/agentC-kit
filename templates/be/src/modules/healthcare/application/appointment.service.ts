import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InMemoryHealthcareRepository } from '../infrastructure/persistence/in-memory-healthcare.repository';
import { AppointmentEntity } from '../domain/appointment.entity';
import {
  AppointmentStatus,
  AppointmentDto,
  CreateAppointmentDto,
  CancelAppointmentDto,
  RescheduleAppointmentDto,
} from '@repo/contracts';

class AsyncLock {
  private queue: Promise<void> = Promise.resolve();

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void;
    const waitPromise = new Promise<void>((resolve) => {
      release = resolve;
    });
    const previousQueue = this.queue;
    this.queue = this.queue.then(() => waitPromise);
    await previousQueue;
    try {
      return await fn();
    } finally {
      release!();
    }
  }
}

function parseSlotRange(
  timeSlot: string,
  defaultDurationMinutes = 30,
): { start: number; end: number } {
  if (timeSlot.includes('-')) {
    const parts = timeSlot.split('-');
    const [sh, sm] = parts[0].trim().split(':').map(Number);
    const [eh, em] = parts[1].trim().split(':').map(Number);
    return { start: sh * 60 + sm, end: eh * 60 + em };
  }
  const [sh, sm] = timeSlot.trim().split(':').map(Number);
  const start = sh * 60 + sm;
  return { start, end: start + defaultDurationMinutes };
}

const DEFAULT_SLOT_DURATION_MINUTES = 30;

function doSlotsOverlap(slot1: string, slot2: string, duration = DEFAULT_SLOT_DURATION_MINUTES): boolean {
  const r1 = parseSlotRange(slot1, duration);
  const r2 = parseSlotRange(slot2, duration);
  return Math.max(r1.start, r2.start) < Math.min(r1.end, r2.end);
}

@Injectable()
export class AppointmentService {
  private readonly lock = new AsyncLock();
  private customNow: Date | null = null;

  constructor(private readonly repo: InMemoryHealthcareRepository) {}

  setCustomNow(now: Date | null): void {
    this.customNow = now;
  }

  getNow(): Date {
    return this.customNow ?? new Date();
  }

  private validateNotPast(dateStr: string, timeSlot: string): void {
    const [year, month, day] = dateStr.split('-').map(Number);
    const { start } = parseSlotRange(timeSlot);
    const hour = Math.floor(start / 60);
    const minute = start % 60;
    const slotDate = new Date(year, month - 1, day, hour, minute);
    const now = this.getNow();
    if (slotDate.getTime() < now.getTime()) {
      throw new BadRequestException('Cannot book an appointment in the past');
    }
  }

  async bookAppointment(dto: CreateAppointmentDto): Promise<AppointmentDto> {
    return this.lock.acquire(async () => {
      this.validateNotPast(dto.date, dto.timeSlot);

      const doctor = await this.repo.findDoctorById(dto.doctorId);
      if (!doctor || !doctor.isActive) {
        throw new BadRequestException('Doctor not found or inactive');
      }

      const service = await this.repo.findServiceById(dto.serviceId);
      if (!service || !service.isActive) {
        throw new BadRequestException('Clinic service not found or inactive');
      }

      const leaves = await this.repo.findLeavesByDoctorId(dto.doctorId);
      if (leaves.some((l) => l.coversDate(dto.date))) {
        throw new BadRequestException('Doctor is on leave on this date');
      }

      const doctorAppointments =
        await this.repo.findAppointmentsByDoctorAndDate(
          dto.doctorId,
          dto.date,
        );
      const hasDoctorConflict = doctorAppointments.some(
        (a) => a.isActive() && doSlotsOverlap(a.timeSlot, dto.timeSlot),
      );
      if (hasDoctorConflict) {
        throw new ConflictException('SLOT_ALREADY_BOOKED');
      }

      const patientAppointments =
        await this.repo.findAppointmentsByPatientAndDate(
          dto.patientId,
          dto.date,
        );
      const hasPatientConflict = patientAppointments.some(
        (a) => a.isActive() && doSlotsOverlap(a.timeSlot, dto.timeSlot),
      );
      if (hasPatientConflict) {
        throw new ConflictException('PATIENT_SCHEDULE_CONFLICT');
      }

      const appointment = new AppointmentEntity({
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        serviceId: dto.serviceId,
        date: dto.date,
        timeSlot: dto.timeSlot,
        status: AppointmentStatus.CONFIRMED,
        notes: dto.notes,
        roomId: doctor.roomNumber,
      });

      const saved = await this.repo.saveAppointment(appointment);
      return saved.toDto();
    });
  }

  async findAll(filter?: {
    doctorId?: string;
    date?: string;
    patientId?: string;
  }): Promise<AppointmentDto[]> {
    const appointments = await this.repo.findAllAppointments(filter);
    return appointments.map((a) => a.toDto());
  }

  async findById(id: string): Promise<AppointmentDto> {
    const appointment = await this.repo.findAppointmentById(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }
    return appointment.toDto();
  }

  async cancelAppointment(dto: CancelAppointmentDto): Promise<AppointmentDto> {
    const appointment = await this.repo.findAppointmentById(dto.appointmentId);
    if (!appointment) {
      throw new NotFoundException(
        `Appointment with id ${dto.appointmentId} not found`,
      );
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'COMPLETED appointment cannot be cancelled.',
      );
    }

    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.LATE_CANCELLATION
    ) {
      throw new BadRequestException('Appointment is already cancelled.');
    }

    const [year, month, day] = appointment.date.split('-').map(Number);
    const { start } = parseSlotRange(appointment.timeSlot);
    const slotDate = new Date(
      year,
      month - 1,
      day,
      Math.floor(start / 60),
      start % 60,
    );
    const now = this.getNow();
    const diffHours =
      (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    const isLate = diffHours < 2;
    appointment.cancel(dto.reason, dto.actor, isLate);
    const saved = await this.repo.saveAppointment(appointment);
    return saved.toDto();
  }

  async rescheduleAppointment(
    dto: RescheduleAppointmentDto,
  ): Promise<AppointmentDto> {
    return this.lock.acquire(async () => {
      const appointment = await this.repo.findAppointmentById(
        dto.appointmentId,
      );
      if (!appointment) {
        throw new NotFoundException(
          `Appointment with id ${dto.appointmentId} not found`,
        );
      }

      if (
        appointment.status !== AppointmentStatus.BOOKED &&
        appointment.status !== AppointmentStatus.CONFIRMED
      ) {
        throw new BadRequestException(
          `Cannot reschedule appointment in status ${appointment.status}`,
        );
      }

      this.validateNotPast(dto.newDate, dto.newTimeSlot);

      const leaves = await this.repo.findLeavesByDoctorId(
        appointment.doctorId,
      );
      if (leaves.some((l) => l.coversDate(dto.newDate))) {
        throw new BadRequestException(
          'Doctor is on leave on the new date',
        );
      }

      const doctorAppointments =
        await this.repo.findAppointmentsByDoctorAndDate(
          appointment.doctorId,
          dto.newDate,
        );
      const hasDoctorConflict = doctorAppointments.some(
        (a) =>
          a.id !== appointment.id &&
          a.isActive() &&
          doSlotsOverlap(a.timeSlot, dto.newTimeSlot),
      );
      if (hasDoctorConflict) {
        throw new ConflictException('SLOT_ALREADY_BOOKED');
      }

      const patientAppointments =
        await this.repo.findAppointmentsByPatientAndDate(
          appointment.patientId,
          dto.newDate,
        );
      const hasPatientConflict = patientAppointments.some(
        (a) =>
          a.id !== appointment.id &&
          a.isActive() &&
          doSlotsOverlap(a.timeSlot, dto.newTimeSlot),
      );
      if (hasPatientConflict) {
        throw new ConflictException('PATIENT_SCHEDULE_CONFLICT');
      }

      appointment.reschedule(dto.newDate, dto.newTimeSlot);
      const saved = await this.repo.saveAppointment(appointment);
      return saved.toDto();
    });
  }
}
