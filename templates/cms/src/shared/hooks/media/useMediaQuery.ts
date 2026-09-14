import { STALE_TIME } from '@/shared/lib/config';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey, useProtectedQuery } from '@/shared/rbac';
import { useTenantStore } from '@/shared/stores';
import type { MediaItem } from '@/shared/models/media-contract';
import { clientFetcher } from '@/shared/lib/http';

export interface MediaQueryParams {
  collectionId?: string;
  search?: string;
  limit?: number;
}

export const MEDIA_QUERY_KEYS = {
  all: ['media'] as const,
  list: (params?: MediaQueryParams, storeId?: string | null) =>
    storeId === undefined ? (['media', 'list', params] as const) : (['media', 'list', { storeId }, params] as const),
};

export const useMediaListQuery = (params?: MediaQueryParams, enabled = true) => {
  const activeStoreId = useTenantStore(s => s.activeStoreId);

  const { data, ...rest } = useProtectedQuery({
    permissions: [permissionKey(PERMISSION_SUBJECTS.MEDIA, PERMISSION_ACTIONS.READ)],
    queryOptions: {
      queryKey: MEDIA_QUERY_KEYS.list(params, activeStoreId),
      queryFn: async ({ signal }) => {
        const query = new URLSearchParams();
        if (params?.collectionId) query.set('collectionId', params.collectionId);
        if (params?.search) query.set('search', params.search);
        if (params?.limit) query.set('limit', String(params.limit));
        const res = await clientFetcher<{ data: MediaItem[] }>(`/api/media?${query.toString()}`, { signal });
        return res;
      },
      staleTime: STALE_TIME.FAST,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      enabled,
    },
  });

  const payload = data?.data;

  return {
    medias: Array.isArray(payload?.data) ? payload.data : [],
    ...rest,
  };
};
