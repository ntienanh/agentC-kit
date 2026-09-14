'use client';

import { AppMetricCard, type AppMetricCardProps } from './AppMetricCard';

export interface AppMetricGridItem extends Omit<AppMetricCardProps, 'className'> {
  id: string;
}

export interface AppMetricsGridProps {
  metrics: AppMetricGridItem[];
  loading?: boolean;
  className?: string;
}

export function AppMetricsGrid({
  metrics,
  loading = false,
  className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
}: Readonly<AppMetricsGridProps>) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <section aria-label='Metrics KPI Summary' className={className}>
      {metrics.map(metric => (
        <AppMetricCard
          key={metric.id}
          label={metric.label}
          value={metric.value}
          icon={metric.icon}
          tone={metric.tone}
          description={metric.description}
          loading={loading || metric.loading}
        />
      ))}
    </section>
  );
}
