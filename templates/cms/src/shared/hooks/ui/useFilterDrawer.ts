'use client';

import { useCallback, useMemo, useState } from 'react';

export interface UseFilterDrawerOptions<T extends Record<string, unknown>> {
  initialFilters: T;
  defaultValues: T;
}

export function useFilterDrawer<T extends Record<string, unknown>>({
  initialFilters,
  defaultValues,
}: UseFilterDrawerOptions<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<T>(initialFilters);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen(prev => !prev), []);

  const activeCount = useMemo(() => {
    let count = 0;
    Object.keys(filters).forEach(key => {
      const current = filters[key];
      const initial = defaultValues[key];
      if (current !== undefined && current !== null && current !== '' && current !== 'all' && current !== initial) {
        count += 1;
      }
    });
    return count;
  }, [filters, defaultValues]);

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters(defaultValues);
  }, [defaultValues]);

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    filters,
    setFilters,
    updateFilter,
    clearAll,
    activeCount,
    hasActiveFilters: activeCount > 0,
  };
}
