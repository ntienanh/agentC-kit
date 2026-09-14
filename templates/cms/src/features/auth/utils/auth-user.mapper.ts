import type { UserInfo } from '@/shared/stores/user.store';
import dayjs from '@/shared/utils/dayjs.util';
import { EntityStatus, UserRole } from '@repo/contracts';

function resolveRole(role?: unknown): UserRole {
  if (!role) return UserRole.USER;
  if (typeof role === 'string') {
    const matched = Object.values(UserRole).find(r => r.toLowerCase() === role.toLowerCase());
    if (matched) return matched;
  }
  if (typeof role === 'object' && role !== null && 'name' in role) {
    const name = String((role as { name?: string }).name);
    const matched = Object.values(UserRole).find(r => r.toLowerCase() === name.toLowerCase());
    if (matched) return matched;
  }
  return UserRole.USER;
}

export function normalizeAuthUser(rawUser?: (Omit<Partial<UserInfo>, 'id' | 'role'> & { id?: string | number; role?: unknown }) | null): UserInfo {
  return {
    id: String(rawUser?.id ?? ''),
    email: rawUser?.email ?? '',
    displayName: rawUser?.displayName ?? null,
    avatar: rawUser?.avatar ?? null,
    phone: rawUser?.phone ?? null,
    role: resolveRole(rawUser?.role),
    status: rawUser?.status ?? EntityStatus.ACTIVE,
    emailVerified: Boolean(rawUser?.emailVerified),
    createdAt: rawUser?.createdAt ?? dayjs().toISOString(),
    updatedAt: rawUser?.updatedAt ?? dayjs().toISOString(),
    permissions: Array.isArray(rawUser?.permissions) ? rawUser.permissions : [],
    accessibleStoreIds: Array.isArray(rawUser?.accessibleStoreIds) ? rawUser.accessibleStoreIds : [],
  };
}
