import { cn } from '@/shared/utils/cn.util';
import type { ReactNode } from 'react';

export type AppPageProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function AppPage({ children, className }: AppPageProps) {
  return <main className={cn('mx-auto flex w-full flex-col gap-6 pb-6 sm:pb-8', className)}>{children}</main>;
}
