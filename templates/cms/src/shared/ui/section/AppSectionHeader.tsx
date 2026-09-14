import { cn } from '@/shared/utils/cn.util';
import type { ReactNode } from 'react';
export type AppSectionHeaderProps = Readonly<{
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}>;

export function AppSectionHeader({ title, description, icon, actions, className }: AppSectionHeaderProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        {icon ? <div className='flex shrink-0 items-center justify-center'>{icon}</div> : null}
        <div className='min-w-0 flex-1'>
          <h3 className='text-foreground m-0 text-sm leading-tight font-bold tracking-tight sm:text-base'>{title}</h3>
          {description ? (
            <p
              className='text-muted-foreground m-0 mt-0.5 truncate text-xs leading-normal font-medium'
              title={typeof description === 'string' ? description : undefined}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className='flex shrink-0 items-center gap-2 sm:justify-end'>{actions}</div> : null}
    </div>
  );
}
