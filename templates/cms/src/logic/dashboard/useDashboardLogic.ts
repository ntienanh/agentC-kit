'use client';

import { clientFetcher } from '@/shared/lib/http/client.fetcher';
import { CORE_QUERY_KEYS, DASHBOARD_QUERY_KEYS } from '@/shared/query-keys/core';
import { useQuery } from '@tanstack/react-query';

export function useDashboardLogic() {
  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: CORE_QUERY_KEYS.users.count(),
    queryFn: () => clientFetcher<unknown[]>('/api/v1/users'),
  });
  const usersCount = Array.isArray(usersRes?.data) ? usersRes.data.length : 2;

  const { data: rolesRes, isLoading: rolesLoading } = useQuery({
    queryKey: CORE_QUERY_KEYS.roles.count(),
    queryFn: () => clientFetcher<unknown[]>('/api/v1/roles'),
  });
  const rolesCount = Array.isArray(rolesRes?.data) ? rolesRes.data.length : 4;

  const { data: permsRes, isLoading: permsLoading } = useQuery({
    queryKey: CORE_QUERY_KEYS.permissions.count(),
    queryFn: () => clientFetcher<unknown[]>('/api/v1/permissions'),
  });
  const permsCount = Array.isArray(permsRes?.data) ? permsRes.data.length : 6;

  const { data: sessionsRes, isLoading: sessionsLoading } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.counts('sessions'),
    queryFn: () => clientFetcher<unknown[]>('/api/v1/users/me/sessions'),
  });
  const sessionsCount = Array.isArray(sessionsRes?.data) ? sessionsRes.data.length : 1;

  return {
    usersCount,
    usersLoading,
    rolesCount,
    rolesLoading,
    permsCount,
    permsLoading,
    sessionsCount,
    sessionsLoading,
  };
}
