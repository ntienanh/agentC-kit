import { BaseEntity, BaseEntityProps } from '../../../core/database/base.entity';
import { DoctorSpecialty, DoctorProfileDto } from '@repo/contracts';

export interface DoctorProps extends BaseEntityProps {
  userId: string;
  fullName: string;
  specialty: DoctorSpecialty;
  licenseNumber: string;
  phoneNumber?: string | null;
  email?: string | null;
  isActive?: boolean;
  roomNumber?: string | null;
}

export class DoctorEntity extends BaseEntity {
  private _userId: string;
  private _fullName: string;
  private _specialty: DoctorSpecialty;
  private _licenseNumber: string;
  private _phoneNumber: string | null;
  private _email: string | null;
  private _isActive: boolean;
  private _roomNumber: string | null;

  constructor(props: DoctorProps) {
    super(props);
    this._userId = props.userId;
    this._fullName = props.fullName;
    this._specialty = props.specialty;
    this._licenseNumber = props.licenseNumber;
    this._phoneNumber = props.phoneNumber ?? null;
    this._email = props.email ?? null;
    this._isActive = props.isActive ?? true;
    this._roomNumber = props.roomNumber ?? null;
  }

  get userId(): string {
    return this._userId;
  }

  get fullName(): string {
    return this._fullName;
  }

  get specialty(): DoctorSpecialty {
    return this._specialty;
  }

  get licenseNumber(): string {
    return this._licenseNumber;
  }

  get phoneNumber(): string | null {
    return this._phoneNumber;
  }

  get email(): string | null {
    return this._email;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get roomNumber(): string | null {
    return this._roomNumber;
  }

  updateDetails(params: {
    fullName?: string;
    specialty?: DoctorSpecialty;
    licenseNumber?: string;
    phoneNumber?: string | null;
    email?: string | null;
    isActive?: boolean;
    roomNumber?: string | null;
  }): void {
    if (params.fullName !== undefined) this._fullName = params.fullName;
    if (params.specialty !== undefined) this._specialty = params.specialty;
    if (params.licenseNumber !== undefined) this._licenseNumber = params.licenseNumber;
    if (params.phoneNumber !== undefined) this._phoneNumber = params.phoneNumber;
    if (params.email !== undefined) this._email = params.email;
    if (params.isActive !== undefined) this._isActive = params.isActive;
    if (params.roomNumber !== undefined) this._roomNumber = params.roomNumber;
    this.markAsUpdated();
  }

  activate(): void {
    this._isActive = true;
    this.markAsUpdated();
  }

  deactivate(): void {
    this._isActive = false;
    this.markAsUpdated();
  }

  toDto(): DoctorProfileDto {
    return {
      id: this.id,
      userId: this._userId,
      fullName: this._fullName,
      specialty: this._specialty,
      licenseNumber: this._licenseNumber,
      phoneNumber: this._phoneNumber,
      email: this._email,
      isActive: this._isActive,
      roomNumber: this._roomNumber,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
