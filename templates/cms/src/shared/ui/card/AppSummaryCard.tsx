import { Skeleton } from 'antd';
import { type LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { AppCard } from './AppCard';

export type AppSummaryCardTone = 'error' | 'info' | 'primary' | 'success' | 'warning';

export type AppSummaryCardProps = Readonly<{
  icon: LucideIcon;
  label: string;
  value: string;
  description?: string;
  tone?: AppSummaryCardTone;
  loading?: boolean;
  className?: string;
  trend?: { value: string; positive?: boolean; neutral?: boolean };
  sparklineData?: number[];
}>;

const toneStyles: Record<AppSummaryCardTone, { iconBg: string; iconBorder: string; iconText: string; spark: string }> =
  {
    primary: {
      iconBg: 'bg-primary/10',
      iconBorder: 'border-primary/20',
      iconText: 'text-primary',
      spark: 'var(--primary)',
    },
    success: {
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      iconBorder: 'border-emerald-500/25',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      spark: 'var(--color-success)',
    },
    warning: {
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      iconBorder: 'border-amber-500/25',
      iconText: 'text-amber-600 dark:text-amber-400',
      spark: 'var(--color-warning)',
    },
    error: {
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
      iconBorder: 'border-rose-500/25',
      iconText: 'text-rose-600 dark:text-rose-400',
      spark: 'var(--color-error)',
    },
    info: {
      iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
      iconBorder: 'border-sky-500/25',
      iconText: 'text-sky-600 dark:text-sky-400',
      spark: 'var(--color-info)',
    },
  };

export function AppSummaryCard({
  icon: Icon,
  label,
  value,
  description,
  tone = 'primary',
  loading = false,
  className,
  trend,
  sparklineData,
}: AppSummaryCardProps) {
  const toneSpec = toneStyles[tone];

  const renderTrendBadge = () => {
    if (!trend) return null;
    const isNeutral = trend.neutral || trend.value.includes('0.0%');
    const isPositive = trend.positive;
    const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
    const badgeStyle = isNeutral
      ? 'bg-muted/80 text-muted-foreground border-border/60'
      : isPositive
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold tracking-tight shadow-2xs ${badgeStyle}`}
        aria-label={`Trend: ${trend.value}`}
      >
        <TrendIcon className='h-3 w-3 shrink-0' aria-hidden='true' />
        <span>{trend.value}</span>
      </span>
    );
  };

  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData, min + 1);
    const width = 80;
    const height = 24;
    const points = sparklineData.map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / (max - min)) * (height - 6) - 3;
      return `${x},${y}`;
    });

    const polylinePoints = points.join(' ');
    const fillPoints = `0,${height} ${polylinePoints} ${width},${height}`;
    const gradientId = `spark-grad-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className='h-6 w-20 shrink-0 overflow-visible opacity-75 transition-opacity duration-200 group-hover:opacity-100'
        preserveAspectRatio='none'
      >
        <defs>
          <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={toneSpec.spark} stopOpacity='0.3' />
            <stop offset='100%' stopColor={toneSpec.spark} stopOpacity='0.0' />
          </linearGradient>
        </defs>
        <polygon points={fillPoints} fill={`url(#${gradientId})`} />
        <polyline
          fill='none'
          stroke={toneSpec.spark}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          points={polylinePoints}
        />
      </svg>
    );
  };

  return (
    <AppCard
      padding='md'
      className={`group hover:border-primary/40 hover:shadow-primary/5 relative overflow-hidden transition-all duration-200 hover:shadow-md ${className ?? ''}`}
    >
      <div className='bg-primary/5 group-hover:bg-primary/10 pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl transition-colors duration-300' />

      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} title={{ width: '50%' }} />
      ) : (
        <div className='relative z-10 flex h-full flex-col justify-between gap-4'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex min-w-0 flex-1 flex-col gap-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='metric-label font-bold tracking-wider uppercase'>{label}</span>
                {renderTrendBadge()}
              </div>

              <div className='mt-1 flex min-w-0 items-baseline justify-between gap-2'>
                <span className='metric-value font-extrabold tracking-tight tabular-nums'>{value}</span>
                {renderSparkline()}
              </div>

              {description && (
                <p className='text-muted-foreground m-0 mt-0.5 text-xs font-medium'>{description}</p>
              )}
            </div>

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-105 sm:h-11 sm:w-11 ${toneSpec.iconBg} ${toneSpec.iconBorder} ${toneSpec.iconText}`}
            >
              <Icon size={20} aria-hidden='true' />
            </div>
          </div>

        </div>
      )}
    </AppCard>
  );
}
