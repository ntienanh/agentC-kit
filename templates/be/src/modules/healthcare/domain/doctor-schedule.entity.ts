import {
  BaseEntity,
  BaseEntityProps,
} from '../../../core/database/base.entity';
import { DoctorScheduleDto } from '@repo/contracts';

export interface DoctorScheduleProps extends BaseEntityProps {
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  slotDurationMinutes?: number;
  isActive?: boolean;
}

export class DoctorScheduleEntity extends BaseEntity {
  private _doctorId: string;
  private _dayOfWeek: number;
  private _startTime: string;
  private _endTime: string;
  private _breakStartTime: string | null;
  private _breakEndTime: string | null;
  private _slotDurationMinutes: number;
  private _isActive: boolean;

  constructor(props: DoctorScheduleProps) {
    super(props);
    this._doctorId = props.doctorId;
    this._dayOfWeek = props.dayOfWeek;
    this._startTime = props.startTime;
    this._endTime = props.endTime;
    this._breakStartTime = props.breakStartTime ?? null;
    this._breakEndTime = props.breakEndTime ?? null;
    this._slotDurationMinutes = props.slotDurationMinutes ?? 30;
    this._isActive = props.isActive ?? true;
  }

  get doctorId(): string {
    return this._doctorId;
  }

  get dayOfWeek(): number {
    return this._dayOfWeek;
  }

  get startTime(): string {
    return this._startTime;
  }

  get endTime(): string {
    return this._endTime;
  }

  get breakStartTime(): string | null {
    return this._breakStartTime;
  }

  get breakEndTime(): string | null {
    return this._breakEndTime;
  }

  get slotDurationMinutes(): number {
    return this._slotDurationMinutes;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  updateDetails(params: {
    startTime?: string;
    endTime?: string;
    breakStartTime?: string | null;
    breakEndTime?: string | null;
    slotDurationMinutes?: number;
    isActive?: boolean;
  }): void {
    if (params.startTime !== undefined) this._startTime = params.startTime;
    if (params.endTime !== undefined) this._endTime = params.endTime;
    if (params.breakStartTime !== undefined)
      this._breakStartTime = params.breakStartTime;
    if (params.breakEndTime !== undefined)
      this._breakEndTime = params.breakEndTime;
    if (params.slotDurationMinutes !== undefined)
      this._slotDurationMinutes = params.slotDurationMinutes;
    if (params.isActive !== undefined) this._isActive = params.isActive;
    this.markAsUpdated();
  }

  toDto(): DoctorScheduleDto {
    return {
      id: this.id,
      doctorId: this._doctorId,
      dayOfWeek: this._dayOfWeek,
      startTime: this._startTime,
      endTime: this._endTime,
      breakStartTime: this._breakStartTime,
      breakEndTime: this._breakEndTime,
      slotDurationMinutes: this._slotDurationMinutes,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
