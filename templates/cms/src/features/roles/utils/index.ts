import type { RoleListParams } from '../services/role.types';

export const ROLE_QUERY_KEYS = {
  roles: (params?: RoleListParams) => ['roles', params] as const,
  role: (id: string) => ['roles', id] as const,
};
