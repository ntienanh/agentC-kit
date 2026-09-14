import {
  BaseEntity,
  BaseEntityProps,
} from '../../../../core/database/base.entity';
import { EntityStatus, UserRole } from '@shared/enums';

export interface UserProps extends BaseEntityProps {
  email: string;
  passwordHash: string;
  displayName?: string | null;
  avatar?: string | null;
  phone?: string | null;
  role?: UserRole;
  status?: EntityStatus;
  emailVerified?: boolean;
}

export class User extends BaseEntity {
  private _email: string;
  private _passwordHash: string;
  private _displayName: string | null;
  private _avatar: string | null;
  private _phone: string | null;
  private _role: UserRole;
  private _status: EntityStatus;
  private _emailVerified: boolean;

  constructor(props: UserProps) {
    super(props);
    this._email = props.email.toLowerCase().trim();
    this._passwordHash = props.passwordHash;
    this._displayName = props.displayName ?? null;
    this._avatar = props.avatar ?? null;
    this._phone = props.phone ?? null;
    this._role = props.role ?? UserRole.USER;
    this._status = props.status ?? EntityStatus.ACTIVE;
    this._emailVerified = props.emailVerified ?? false;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get displayName(): string | null {
    return this._displayName;
  }

  get avatar(): string | null {
    return this._avatar;
  }

  get phone(): string | null {
    return this._phone;
  }

  get role(): UserRole {
    return this._role;
  }

  get status(): EntityStatus {
    return this._status;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  updateProfile(params: {
    displayName?: string | null;
    avatar?: string | null;
    phone?: string | null;
  }): void {
    if (params.displayName !== undefined) {
      this._displayName = params.displayName;
    }
    if (params.avatar !== undefined) {
      this._avatar = params.avatar;
    }
    if (params.phone !== undefined) {
      this._phone = params.phone;
    }
    this.markAsUpdated();
  }

  updateRole(role: UserRole): void {
    this._role = role;
    this.markAsUpdated();
  }

  updateStatus(status: EntityStatus): void {
    this._status = status;
    this.markAsUpdated();
  }

  updatePassword(newHash: string): void {
    if (!newHash) {
      throw new Error('Password hash cannot be empty');
    }
    this._passwordHash = newHash;
    this.markAsUpdated();
  }
}
