'use client';

import type { AppMetricGridItem } from '@/shared/ui/card/AppMetricsGrid';
import { useMemo } from 'react';

export interface UseAppMetricsOptions<T> {
  data: T[];
  compute: (data: T[]) => AppMetricGridItem[];
  isLoading?: boolean;
}

export function useAppMetrics<T>({
  data,
  compute,
  isLoading = false,
}: UseAppMetricsOptions<T>): { metrics: AppMetricGridItem[]; isLoading: boolean } {
  const metrics = useMemo(() => {
    if (!data) return [];
    return compute(data).map(m => ({
      ...m,
      loading: isLoading,
    }));
  }, [data, compute, isLoading]);

  return {
    metrics,
    isLoading,
  };
}
