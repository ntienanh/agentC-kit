export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  overview: () => [...DASHBOARD_QUERY_KEYS.all, 'overview'] as const,
  counts: (entity: string) => [...DASHBOARD_QUERY_KEYS.all, entity, 'count'] as const,
};

export const CORE_QUERY_KEYS = {
  users: {
    all: ['users'] as const,
    count: () => ['users', 'count'] as const,
  },
  roles: {
    all: ['roles'] as const,
    count: () => ['roles', 'count'] as const,
  },
  permissions: {
    all: ['permissions'] as const,
    count: () => ['permissions', 'count'] as const,
  },
};
