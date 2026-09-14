import {
  BaseEntity,
  BaseEntityProps,
} from '../../../core/database/base.entity';
import { QueueStatus, QueueTicketDto } from '@repo/contracts';
import { BadRequestException } from '@nestjs/common';

export interface QueueTicketProps extends BaseEntityProps {
  queueNumber: number;
  appointmentId: string;
  patientName: string;
  doctorName: string;
  status?: QueueStatus;
  estimatedTime: string;
  date: string;
}

export class QueueTicketEntity extends BaseEntity {
  private _queueNumber: number;
  private _appointmentId: string;
  private _patientName: string;
  private _doctorName: string;
  private _status: QueueStatus;
  private _estimatedTime: string;
  private _date: string;

  constructor(props: QueueTicketProps) {
    super(props);
    this._queueNumber = props.queueNumber;
    this._appointmentId = props.appointmentId;
    this._patientName = props.patientName;
    this._doctorName = props.doctorName;
    this._status = props.status ?? QueueStatus.WAITING;
    this._estimatedTime = props.estimatedTime;
    this._date = props.date;
  }

  get queueNumber(): number {
    return this._queueNumber;
  }

  get appointmentId(): string {
    return this._appointmentId;
  }

  get patientName(): string {
    return this._patientName;
  }

  get doctorName(): string {
    return this._doctorName;
  }

  get status(): QueueStatus {
    return this._status;
  }

  get estimatedTime(): string {
    return this._estimatedTime;
  }

  get date(): string {
    return this._date;
  }

  call(): void {
    if (this._status === QueueStatus.COMPLETED) {
      throw new BadRequestException('Cannot call a completed ticket.');
    }
    this._status = QueueStatus.CALLED;
    this.markAsUpdated();
  }

  startConsultation(): void {
    this._status = QueueStatus.IN_CONSULTATION;
    this.markAsUpdated();
  }

  complete(): void {
    this._status = QueueStatus.COMPLETED;
    this.markAsUpdated();
  }

  skip(): void {
    this._status = QueueStatus.SKIPPED;
    this.markAsUpdated();
  }

  toDto(): QueueTicketDto {
    return {
      id: this.id,
      queueNumber: this._queueNumber,
      appointmentId: this._appointmentId,
      patientName: this._patientName,
      doctorName: this._doctorName,
      status: this._status,
      estimatedTime: this._estimatedTime,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
