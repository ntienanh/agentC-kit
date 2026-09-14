export const RBAC_CACHE_KEYS = {
  roleList: (page?: number, limit?: number) => (page && limit ? `rbac:role-list:${page}:${limit}` : 'rbac:role-list'),

  roleDetail: (roleId: string) => `rbac:role-detail:${roleId}`,

  permissionList: () => 'rbac:permission-list',

  permissionActions: () => 'rbac:permission-actions',

  auditRoles: (page?: number, limit?: number) =>
    page && limit ? `rbac:audit-roles:${page}:${limit}` : 'rbac:audit-roles',

  auditPermissions: (page?: number, limit?: number) =>
    page && limit ? `rbac:audit-permissions:${page}:${limit}` : 'rbac:audit-permissions',
} as const;
