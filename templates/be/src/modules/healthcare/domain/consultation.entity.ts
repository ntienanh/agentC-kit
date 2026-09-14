import {
  BaseEntity,
  BaseEntityProps,
} from '../../../core/database/base.entity';
import {
  ConsultationDto,
  IVitalSignsDto,
  IPrescriptionItemDto,
} from '@repo/contracts';
import { BadRequestException } from '@nestjs/common';

export interface ConsultationProps extends BaseEntityProps {
  appointmentId: string;
  doctorId: string;
  chiefComplaint: string;
  symptoms: string;
  vitals: IVitalSignsDto;
  diagnosis: string;
  treatmentPlan: string;
  prescriptionItems: IPrescriptionItemDto[];
  followUpDays?: number | null;
  isLocked?: boolean;
}

export class ConsultationEntity extends BaseEntity {
  private _appointmentId: string;
  private _doctorId: string;
  private _chiefComplaint: string;
  private _symptoms: string;
  private _vitals: IVitalSignsDto;
  private _diagnosis: string;
  private _treatmentPlan: string;
  private _prescriptionItems: IPrescriptionItemDto[];
  private _followUpDays: number | null;
  private _isLocked: boolean;

  constructor(props: ConsultationProps) {
    super(props);
    this._appointmentId = props.appointmentId;
    this._doctorId = props.doctorId;
    this._chiefComplaint = props.chiefComplaint;
    this._symptoms = props.symptoms;
    this._vitals = props.vitals;
    this._diagnosis = props.diagnosis;
    this._treatmentPlan = props.treatmentPlan;
    this._prescriptionItems = props.prescriptionItems;
    this._followUpDays = props.followUpDays ?? null;
    this._isLocked = props.isLocked ?? false;
  }

  get appointmentId(): string {
    return this._appointmentId;
  }

  get doctorId(): string {
    return this._doctorId;
  }

  get chiefComplaint(): string {
    return this._chiefComplaint;
  }

  get symptoms(): string {
    return this._symptoms;
  }

  get vitals(): IVitalSignsDto {
    return this._vitals;
  }

  get diagnosis(): string {
    return this._diagnosis;
  }

  get treatmentPlan(): string {
    return this._treatmentPlan;
  }

  get prescriptionItems(): IPrescriptionItemDto[] {
    return this._prescriptionItems;
  }

  get followUpDays(): number | null {
    return this._followUpDays;
  }

  get isLocked(): boolean {
    return this._isLocked;
  }

  lock(): void {
    this._isLocked = true;
    this.markAsUpdated();
  }

  updateDetails(params: {
    chiefComplaint?: string;
    symptoms?: string;
    vitals?: IVitalSignsDto;
    diagnosis?: string;
    treatmentPlan?: string;
    prescriptionItems?: IPrescriptionItemDto[];
    followUpDays?: number | null;
  }): void {
    if (this._isLocked) {
      throw new BadRequestException('Consultation is locked and immutable.');
    }
    if (params.chiefComplaint !== undefined)
      this._chiefComplaint = params.chiefComplaint;
    if (params.symptoms !== undefined) this._symptoms = params.symptoms;
    if (params.vitals !== undefined) this._vitals = params.vitals;
    if (params.diagnosis !== undefined) this._diagnosis = params.diagnosis;
    if (params.treatmentPlan !== undefined)
      this._treatmentPlan = params.treatmentPlan;
    if (params.prescriptionItems !== undefined)
      this._prescriptionItems = params.prescriptionItems;
    if (params.followUpDays !== undefined)
      this._followUpDays = params.followUpDays;
    this.markAsUpdated();
  }

  toDto(): ConsultationDto {
    return {
      id: this.id,
      appointmentId: this._appointmentId,
      doctorId: this._doctorId,
      chiefComplaint: this._chiefComplaint,
      symptoms: this._symptoms,
      vitals: this._vitals,
      diagnosis: this._diagnosis,
      treatmentPlan: this._treatmentPlan,
      prescriptionItems: this._prescriptionItems,
      followUpDays: this._followUpDays,
      isLocked: this._isLocked,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
