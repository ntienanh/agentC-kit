const apiFetch = fetch;
'use client';

import {
  QUERY_SELECT_DEBOUNCE_MS,
  QUERY_SELECT_DEFAULT_LIMIT,
  QUERY_SELECT_DEFAULT_PAGE,
} from '@/configs/core/ui-policy.config';
import type {
  QuerySelectOption,
  QuerySelectQueryFnParams,
  QuerySelectQueryResponse,
} from '@/shared/ui/select/QuerySelect.type';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useDebounceCallback } from './useDebounceCallback';

interface UseQuerySelectParams<T> {
  queryConfig: {
    queryKey: readonly unknown[];
    queryFn: (
      params: QuerySelectQueryFnParams & { filters?: Record<string, unknown> },
    ) => Promise<QuerySelectQueryResponse<T>>;
  };
  mapOption: (item: T) => QuerySelectOption<T>;
  debounceMs?: number;
  filters?: Record<string, unknown>;
  defaultPaging?: {
    page: number;
    limit: number;
  };
}

export function useQuerySelect<T>({
  queryConfig,
  mapOption,
  debounceMs = QUERY_SELECT_DEBOUNCE_MS,
  filters = {},
  defaultPaging = { page: QUERY_SELECT_DEFAULT_PAGE, limit: QUERY_SELECT_DEFAULT_LIMIT },
}: UseQuerySelectParams<T>) {
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounceCallback((value: string) => {
    setSearch(value);
  }, debounceMs);

  const handleSearch = useCallback(
    (val: string) => {
      debouncedSearch(val);
    },
    [debouncedSearch],
  );

  const queryKey = useMemo(
    () => [...queryConfig.queryKey, { search, ...filters, limit: defaultPaging.limit }],
    [defaultPaging.limit, filters, queryConfig.queryKey, search],
  );

  const queryFn = async ({ pageParam }: { pageParam?: number }) => {
    const page = pageParam ?? defaultPaging.page;

    const res = await queryConfig.queryFn({
      search,
      filters,
      page,
      limit: defaultPaging.limit,
    });

    return {
      items: res.data.map(mapOption),
      nextPage: res.paging?.nextPage ?? null,
    };
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: defaultPaging.page,
  });

  const options = useMemo(() => {
    if (!data?.pages) return [];

    return data.pages.flatMap(page => page.items);
  }, [data]);

  const handleReset = useCallback(() => {
    setSearch('');
    refetch();
  }, [refetch]);

  return {
    options,
    handleSearch,
    fetchNextPage,
    handleReset,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  };
}
