import { STALE_TIME } from '@/shared/lib/config';
import { useQuery } from '@tanstack/react-query';
import { userManagementApi } from '@/features/users/services/user-management.service';
import { USER_MANAGEMENT_QUERY_KEYS } from '@/features/users/utils';

export const useSelfProfileQuery = () => {
  const { data, ...rest } = useQuery({
    queryKey: USER_MANAGEMENT_QUERY_KEYS.selfProfile,
    queryFn: ({ signal }) => userManagementApi.getSelfProfile(signal),
    staleTime: STALE_TIME.SESSION,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    profile: data?.data ?? null,
    ...rest,
  };
};
