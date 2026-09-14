'use client';

import {
  QUERY_SELECT_DEBOUNCE_MS,
  QUERY_SELECT_DEFAULT_LIMIT,
  QUERY_SELECT_DEFAULT_PAGE,
  QUERY_SELECT_SCROLL_THRESHOLD_PX,
} from '@/configs/core/ui-policy.config';
import { useDebounceCallback } from '@/shared/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Select, Spin } from 'antd';
import type { UIEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { QuerySelectOption, QuerySelectProps } from './QuerySelect.type';

export function QuerySelect<T>({
  queryConfig,
  mapOption,
  multiple,
  placeholder,
  value,
  onChange,
  defaultValuesFetcher,
}: Readonly<QuerySelectProps<T>>) {
  const [search, setSearch] = useState('');
  const [defaultOptions, setDefaultOptions] = useState<QuerySelectOption<T>[]>([]);
  const [isDefaultLoading, setIsDefaultLoading] = useState(false);
  const isInitialLoadRef = useRef(true);

  const debouncedSearch = useDebounceCallback((v: string) => {
    setSearch(v);
  }, QUERY_SELECT_DEBOUNCE_MS);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [...queryConfig.queryKey, search],
    queryFn: ({ pageParam = QUERY_SELECT_DEFAULT_PAGE }) =>
      queryConfig.queryFn({
        search,
        page: pageParam,
        limit: QUERY_SELECT_DEFAULT_LIMIT,
      }),
    getNextPageParam: last => last.paging?.nextPage ?? undefined,
    initialPageParam: QUERY_SELECT_DEFAULT_PAGE,
  });

  const isSelectLoading = isLoading || isDefaultLoading;
  const isListLoading = isFetchingNextPage && !isSelectLoading;

  const pagedOptions = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data.map(mapOption));
  }, [data, mapOption]);

  useEffect(() => {
    const loadDefaults = async () => {
      if (!defaultValuesFetcher) return;
      if (!isInitialLoadRef.current) return;

      if (!value || value.length === 0) {
        setDefaultOptions([]);
        return;
      }

      setIsDefaultLoading(true);

      try {
        if (!multiple && typeof value === 'string') {
          const item = await defaultValuesFetcher(value);
          setDefaultOptions(item ? [item] : []);
        }

        if (multiple && Array.isArray(value)) {
          const results = await Promise.all(value.map(id => defaultValuesFetcher(id)));
          setDefaultOptions(results.filter((item): item is QuerySelectOption<T> => item !== null));
        }
      } finally {
        setIsDefaultLoading(false);
        isInitialLoadRef.current = false;
      }
    };

    loadDefaults();
  }, [value, multiple, defaultValuesFetcher]);

  const mergedOptions = useMemo(() => {
    const map = new Map<string, QuerySelectOption<T>>();
    [...defaultOptions, ...pagedOptions].forEach(op => {
      if (!map.has(op.value)) map.set(op.value, op);
    });
    return Array.from(map.values());
  }, [defaultOptions, pagedOptions]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const isBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - QUERY_SELECT_SCROLL_THRESHOLD_PX;

    if (isBottom && hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={debouncedSearch}
      mode={multiple ? 'multiple' : undefined}
      placeholder={placeholder}
      loading={isLoading || isDefaultLoading}
      onPopupScroll={handleScroll}
      notFoundContent={isListLoading ? null : <Spin size='small' />}
      options={mergedOptions}
      value={value}
      onChange={onChange}
      className='w-full'
    />
  );
}
