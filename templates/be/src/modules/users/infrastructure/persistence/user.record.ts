import { EntityStatus, UserRole } from '@shared/enums';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  avatar: string | null;
  phone: string | null;
  role: UserRole;
  status: EntityStatus;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
