export const PERMISSION_ENDPOINTS = {
  LIST: '/api/v1/permissions',
  DETAIL: (id: string) => `/api/v1/permissions/${id}`,
  ACTIONS: '/api/v1/permissions/actions',
} as const;
