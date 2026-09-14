import { cn } from '@/shared/utils/cn.util';
import { Tag, type TagProps } from 'antd';
import type { ReactNode } from 'react';

export type AppStatusTone = 'default' | 'error' | 'info' | 'primary' | 'success' | 'warning';

export type AppStatusTagProps = Readonly<
  Omit<TagProps, 'color'> & {
    children: ReactNode;
    tone?: AppStatusTone;
    size?: 'sm' | 'md';
  }
>;

const toneClassNames: Record<AppStatusTone, { dot: string; container: string }> = {
  default: {
    dot: 'bg-muted-foreground!',
    container: 'bg-muted/70! text-muted-foreground! border! border-border/60!',
  },
  error: {
    dot: 'bg-error!',
    container: 'bg-error-bg! text-error! border! border-error/30! font-semibold!',
  },
  info: {
    dot: 'bg-info! animate-pulse!',
    container: 'bg-info-bg! text-info! border! border-info/30! font-semibold!',
  },
  primary: {
    dot: 'bg-primary!',
    container: 'bg-primary/15! text-primary! border! border-primary/30! font-semibold!',
  },
  success: {
    dot: 'bg-success!',
    container: 'bg-success-bg! text-success! border! border-success/30! font-semibold!',
  },
  warning: {
    dot: 'bg-warning!',
    container: 'bg-warning-bg! text-warning! border! border-warning/30! font-semibold!',
  },
};

const sizeClassNames: Record<'sm' | 'md', string> = {
  sm: 'px-2! py-0.5! text-xs!',
  md: 'px-2.5! py-1! text-xs!',
};

export function AppStatusTag({ children, className, tone = 'default', size = 'sm', ...props }: AppStatusTagProps) {
  const spec = toneClassNames[tone] || toneClassNames.default;
  const sizeClass = sizeClassNames[size];

  return (
    <Tag
      {...props}
      variant='filled'
      className={cn(
        'm-0! inline-flex items-center gap-1.5 rounded-full! leading-normal! font-semibold! shadow-2xs transition-all duration-150',
        sizeClass,
        spec.container,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 flex-none rounded-full', spec.dot)} aria-hidden='true' />
      {children}
    </Tag>
  );
}
