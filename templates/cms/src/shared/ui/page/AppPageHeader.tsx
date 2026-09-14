import { cn } from '@/shared/utils/cn.util';
import { Typography } from 'antd';
import type { ReactNode } from 'react';

const { Title } = Typography;

export type AppPageHeaderProps = Readonly<{
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  toolbar?: ReactNode;
  actions?: ReactNode;
  summary?: ReactNode;
  className?: string;
}>;

export function AppPageHeader({
  title,
  description,
  eyebrow,
  meta,
  toolbar,
  actions,
  summary,
  className,
}: AppPageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4', className)}>
      <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0 flex-1'>
          {eyebrow ? <div className='eyebrow mb-2 flex items-center gap-2'>{eyebrow}</div> : null}
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <Title level={2} className='mb-0! text-2xl! leading-tight! font-semibold! tracking-tight! text-pretty'>
              {title}
            </Title>
            {meta ? (
              <div className='text-muted-foreground flex items-center gap-2 text-xs sm:ml-auto'>{meta}</div>
            ) : null}
          </div>
          {description ? <p className='text-muted-foreground m-0 mt-1 text-sm'>{description}</p> : null}
        </div>

        {actions && !toolbar ? (
          <div className='flex shrink-0 flex-wrap items-center gap-2 sm:mt-1 sm:justify-end'>{actions}</div>
        ) : null}
      </div>

      {toolbar || (actions && toolbar) ? (
        <div className='border-border/40 flex min-w-0 flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='min-w-0 flex-1'>{toolbar}</div>
          {actions && toolbar ? (
            <div className='flex shrink-0 flex-wrap items-center gap-2 sm:justify-end'>{actions}</div>
          ) : null}
        </div>
      ) : null}

      {summary ? <div className='min-w-0'>{summary}</div> : null}
    </header>
  );
}
