'use client';

import { useQuery } from '@tanstack/react-query';
import { userManagementApi } from '@/features/users/services/user-management.service';
import { USER_MANAGEMENT_QUERY_KEYS } from '@/features/users/utils';

export function useSessionsLogic() {
  return useQuery({
    queryKey: USER_MANAGEMENT_QUERY_KEYS.selfSessions,
    queryFn: async ({ signal }) => {
      const response = await userManagementApi.getSelfSessions(signal);
      return (response.data ?? []).map(session => ({ ...session, id: session.jti }));
    },
  });
}
