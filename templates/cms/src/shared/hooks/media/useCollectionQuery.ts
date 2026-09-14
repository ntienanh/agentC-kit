import { STALE_TIME } from '@/shared/lib/config';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey, useProtectedQuery } from '@/shared/rbac';
import { useTenantStore } from '@/shared/stores';
import type { MediaCollection } from '@/shared/models/media-contract';
import { clientFetcher } from '@/shared/lib/http';

export const COLLECTION_QUERY_KEYS = {
  all: ['media-collections'] as const,
  list: (storeId?: string | null) =>
    storeId === undefined ? (['media-collections', 'list'] as const) : (['media-collections', 'list', { storeId }] as const),
};

export const useCollectionListQuery = (enabled = true) => {
  const activeStoreId = useTenantStore(s => s.activeStoreId);

  const { data, ...rest } = useProtectedQuery({
    permissions: [permissionKey(PERMISSION_SUBJECTS.MEDIA, PERMISSION_ACTIONS.READ)],
    queryOptions: {
      queryKey: COLLECTION_QUERY_KEYS.list(activeStoreId),
      queryFn: async ({ signal }) => {
        const res = await clientFetcher<{ data: MediaCollection[]; rootCount?: number }>('/api/media-collections', { signal });
        return res;
      },
      staleTime: STALE_TIME.MEDIUM,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      enabled,
    },
  });

  const payload = data?.data;

  return {
    collections: Array.isArray(payload?.data) ? payload.data : [],
    rootCount: payload?.rootCount ?? 0,
    ...rest,
  };
};
