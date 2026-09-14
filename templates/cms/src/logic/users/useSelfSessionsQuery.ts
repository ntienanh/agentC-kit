import { useQuery } from '@tanstack/react-query';
import { userManagementApi } from '@/features/users/services/user-management.service';
import { USER_MANAGEMENT_QUERY_KEYS } from '@/features/users/utils';

const ONE_MINUTE_IN_MS = 60 * 1000;

export const useSelfSessionsQuery = () => {
  const { data, ...rest } = useQuery({
    queryKey: USER_MANAGEMENT_QUERY_KEYS.selfSessions,
    queryFn: ({ signal }) => userManagementApi.getSelfSessions(signal),
    staleTime: ONE_MINUTE_IN_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    sessions: data?.data ?? [],
    ...rest,
  };
};
