import {
  BaseEntity,
  BaseEntityProps,
} from '../../../core/database/base.entity';
import { ConsultationEntity } from './consultation.entity';
import { MedicalRecordDto } from '@repo/contracts';

export interface MedicalRecordProps extends BaseEntityProps {
  patientId: string;
  consultations?: ConsultationEntity[];
}

export class MedicalRecordEntity extends BaseEntity {
  private _patientId: string;
  private _consultations: ConsultationEntity[];

  constructor(props: MedicalRecordProps) {
    super(props);
    this._patientId = props.patientId;
    this._consultations = props.consultations ? [...props.consultations] : [];
  }

  get patientId(): string {
    return this._patientId;
  }

  get consultations(): ConsultationEntity[] {
    return this._consultations;
  }

  appendConsultation(consultation: ConsultationEntity): void {
    this._consultations.push(consultation);
    this.markAsUpdated();
  }

  toDto(): MedicalRecordDto {
    return {
      id: this.id,
      patientId: this._patientId,
      consultations: this._consultations.map((c) => c.toDto()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
