import type { UserListParams } from '../services/user-management.types';

const userManagementKeyRoot = ['user-management'] as const;

export const USER_MANAGEMENT_QUERY_KEYS = {
  all: userManagementKeyRoot,
  lists: (activeStoreId: string | null) => [...userManagementKeyRoot, 'list', activeStoreId] as const,
  list: (params: UserListParams | undefined, activeStoreId: string | null) =>
    [...USER_MANAGEMENT_QUERY_KEYS.lists(activeStoreId), params ?? {}] as const,
  details: () => [...userManagementKeyRoot, 'detail'] as const,
  detail: (id: string) => [...USER_MANAGEMENT_QUERY_KEYS.details(), id] as const,
  storeAssignments: (id: string) => [...userManagementKeyRoot, 'store-assignments', id] as const,
  sessions: (userId: string) => [...userManagementKeyRoot, 'sessions', userId] as const,
  selfProfile: [...userManagementKeyRoot, 'self-profile'] as const,
  selfSessions: [...userManagementKeyRoot, 'self-sessions'] as const,
};
