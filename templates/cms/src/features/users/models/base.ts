import type { RoleObject } from '../../roles/models';

export interface PublicProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  phone: string | null;
  role: RoleObject | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  deletedAt: string | null;
  deletedReason: string | null;
  createdById: number | null;
  updatedById: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionInfo {
  jti: string;
  createdAt: string;
  expiresAt: string;
}
