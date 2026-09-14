import { clientFetcher } from '@/shared/lib/http';
import { PERMISSION_ACTIONS } from '@/shared/rbac';
import { useQuery } from '@tanstack/react-query';
import { PERMISSION_ENDPOINTS } from '@/features/permissions/services/permissions.endpoints';
import { RBAC_QUERY_KEYS } from '@/features/permissions/utils/rbac-query-key.config';

const FALLBACK_ACTIONS = Object.values(PERMISSION_ACTIONS);
const HIDDEN_ACTIONS = new Set(['manage', 'write']);

export function usePermissionActions() {
  const { data, isLoading } = useQuery({
    queryKey: RBAC_QUERY_KEYS.actions(),
    queryFn: () => clientFetcher<string[]>(PERMISSION_ENDPOINTS.ACTIONS, { method: 'GET' }),
    staleTime: Infinity,
  });

  const actions: string[] = (data?.data ?? FALLBACK_ACTIONS).filter(action => !HIDDEN_ACTIONS.has(action));
  return { actions, isLoading };
}
