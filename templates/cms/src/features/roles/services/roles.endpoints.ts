export const ROLE_ENDPOINTS = {
  LIST: '/api/v1/roles',
  DETAIL: (id: string) => `/api/v1/roles/${id}`,
  PERMISSIONS: (id: string) => `/api/v1/roles/${id}/permissions`,
} as const;
