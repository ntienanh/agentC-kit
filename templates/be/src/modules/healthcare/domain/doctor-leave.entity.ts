import { BaseEntity, BaseEntityProps } from '../../../core/database/base.entity';
import { DoctorLeaveDto } from '@repo/contracts';

export interface DoctorLeaveProps extends BaseEntityProps {
  doctorId: string;
  startDate: string;
  endDate: string;
  reason: string;
  isApproved?: boolean;
}

export class DoctorLeaveEntity extends BaseEntity {
  private _doctorId: string;
  private _startDate: string;
  private _endDate: string;
  private _reason: string;
  private _isApproved: boolean;

  constructor(props: DoctorLeaveProps) {
    super(props);
    this._doctorId = props.doctorId;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._reason = props.reason;
    this._isApproved = props.isApproved ?? true;
  }

  get doctorId(): string {
    return this._doctorId;
  }

  get startDate(): string {
    return this._startDate;
  }

  get endDate(): string {
    return this._endDate;
  }

  get reason(): string {
    return this._reason;
  }

  get isApproved(): boolean {
    return this._isApproved;
  }

  approve(): void {
    this._isApproved = true;
    this.markAsUpdated();
  }

  reject(): void {
    this._isApproved = false;
    this.markAsUpdated();
  }

  coversDate(date: string): boolean {
    return this._isApproved && this._startDate <= date && date <= this._endDate;
  }

  toDto(): DoctorLeaveDto {
    return {
      id: this.id,
      doctorId: this._doctorId,
      startDate: this._startDate,
      endDate: this._endDate,
      reason: this._reason,
      isApproved: this._isApproved,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
