'use client';

import { useNuqsSearchState } from '@/shared/hooks/data/useNuqsSearchState';
import { useCallback, useState } from 'react';

export interface UseAppTableToolbarOptions {
  defaultPage?: number;
  defaultLimit?: number;
  searchQueryKey?: string;
  defaultSearch?: string;
}

export function useAppTableToolbar(options: UseAppTableToolbarOptions = {}) {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    searchQueryKey = 'search',
    defaultSearch = '',
  } = options;

  const [page, setPage] = useState<number>(defaultPage);
  const [limit, setLimit] = useState<number>(defaultLimit);
  const [search, setSearch] = useNuqsSearchState(searchQueryKey, defaultSearch);

  const handlePageChange = useCallback((newPage: number, newSize: number) => {
    setPage(newPage);
    setLimit(newSize);
  }, []);

  const handleSearchChange = useCallback((val: string) => {
    setPage(1);
    void setSearch(val.trim() ? val : null);
  }, [setSearch]);

  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    setPage,
    limit,
    setLimit,
    search: search ?? '',
    handlePageChange,
    handleSearchChange,
    resetPagination,
  };
}
