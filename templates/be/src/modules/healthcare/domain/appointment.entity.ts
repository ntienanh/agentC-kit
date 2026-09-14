import { BaseEntity, BaseEntityProps } from '../../../core/database/base.entity';
import {
  AppointmentStatus,
  AppointmentDto,
  CancellationActor,
} from '@repo/contracts';
import { BadRequestException } from '@nestjs/common';

export interface AppointmentProps extends BaseEntityProps {
  patientId: string;
  doctorId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  status?: AppointmentStatus;
  notes?: string | null;
  roomId?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: CancellationActor | null;
  cancelledAt?: Date | null;
}

export class AppointmentEntity extends BaseEntity {
  private _patientId: string;
  private _doctorId: string;
  private _serviceId: string;
  private _date: string;
  private _timeSlot: string;
  private _status: AppointmentStatus;
  private _notes: string | null;
  private _roomId: string | null;
  private _cancellationReason: string | null;
  private _cancelledBy: CancellationActor | null;
  private _cancelledAt: Date | null;

  constructor(props: AppointmentProps) {
    super(props);
    this._patientId = props.patientId;
    this._doctorId = props.doctorId;
    this._serviceId = props.serviceId;
    this._date = props.date;
    this._timeSlot = props.timeSlot;
    this._status = props.status ?? AppointmentStatus.CONFIRMED;
    this._notes = props.notes ?? null;
    this._roomId = props.roomId ?? null;
    this._cancellationReason = props.cancellationReason ?? null;
    this._cancelledBy = props.cancelledBy ?? null;
    this._cancelledAt = props.cancelledAt ?? null;
  }

  get patientId(): string {
    return this._patientId;
  }

  get doctorId(): string {
    return this._doctorId;
  }

  get serviceId(): string {
    return this._serviceId;
  }

  get date(): string {
    return this._date;
  }

  get timeSlot(): string {
    return this._timeSlot;
  }

  get status(): AppointmentStatus {
    return this._status;
  }

  get notes(): string | null {
    return this._notes;
  }

  get roomId(): string | null {
    return this._roomId;
  }

  get cancellationReason(): string | null {
    return this._cancellationReason;
  }

  get cancelledBy(): CancellationActor | null {
    return this._cancelledBy;
  }

  get cancelledAt(): Date | null {
    return this._cancelledAt;
  }

  confirm(): void {
    if (
      this._status === AppointmentStatus.CANCELLED ||
      this._status === AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot confirm appointment in ${this._status} status.`,
      );
    }
    this._status = AppointmentStatus.CONFIRMED;
    this.markAsUpdated();
  }

  checkIn(): void {
    if (
      this._status !== AppointmentStatus.CONFIRMED &&
      this._status !== AppointmentStatus.BOOKED
    ) {
      throw new BadRequestException(
        `Cannot check-in appointment in ${this._status} status.`,
      );
    }
    this._status = AppointmentStatus.CHECKED_IN;
    this.markAsUpdated();
  }

  startConsultation(roomId?: string): void {
    if (
      this._status !== AppointmentStatus.CHECKED_IN &&
      this._status !== AppointmentStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        `Cannot start consultation for appointment in ${this._status} status.`,
      );
    }
    this._status = AppointmentStatus.IN_CONSULTATION;
    if (roomId) {
      this._roomId = roomId;
    }
    this.markAsUpdated();
  }

  complete(): void {
    if (
      this._status !== AppointmentStatus.IN_CONSULTATION &&
      this._status !== AppointmentStatus.CHECKED_IN
    ) {
      throw new BadRequestException(
        `Cannot complete appointment in ${this._status} status.`,
      );
    }
    this._status = AppointmentStatus.COMPLETED;
    this.markAsUpdated();
  }

  cancel(reason: string, actor: CancellationActor, isLate: boolean): void {
    if (this._status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'COMPLETED appointment cannot be cancelled.',
      );
    }
    if (
      this._status === AppointmentStatus.CANCELLED ||
      this._status === AppointmentStatus.LATE_CANCELLATION
    ) {
      throw new BadRequestException('Appointment is already cancelled.');
    }
    this._status = isLate
      ? AppointmentStatus.LATE_CANCELLATION
      : AppointmentStatus.CANCELLED;
    this._cancellationReason = reason;
    this._cancelledBy = actor;
    this._cancelledAt = new Date();
    this.markAsUpdated();
  }

  reschedule(newDate: string, newTimeSlot: string): void {
    if (
      this._status !== AppointmentStatus.BOOKED &&
      this._status !== AppointmentStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        `Rescheduling is only allowed for BOOKED or CONFIRMED appointments, current status is ${this._status}.`,
      );
    }
    this._date = newDate;
    this._timeSlot = newTimeSlot;
    this.markAsUpdated();
  }

  markNoShow(): void {
    if (
      this._status === AppointmentStatus.COMPLETED ||
      this._status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot mark appointment as NO_SHOW from ${this._status}.`,
      );
    }
    this._status = AppointmentStatus.NO_SHOW;
    this.markAsUpdated();
  }

  setRoomId(roomId: string): void {
    this._roomId = roomId;
    this.markAsUpdated();
  }

  isActive(): boolean {
    return (
      this._status === AppointmentStatus.BOOKED ||
      this._status === AppointmentStatus.CONFIRMED ||
      this._status === AppointmentStatus.CHECKED_IN ||
      this._status === AppointmentStatus.IN_CONSULTATION
    );
  }

  toDto(): AppointmentDto {
    return {
      id: this.id,
      patientId: this._patientId,
      doctorId: this._doctorId,
      serviceId: this._serviceId,
      date: this._date,
      timeSlot: this._timeSlot,
      status: this._status,
      notes: this._notes,
      roomId: this._roomId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
