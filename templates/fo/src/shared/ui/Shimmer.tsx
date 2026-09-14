import React from 'react';
import { cn } from '@/shared/utils/cn.util';

interface ShimmerProps {
  className?: string;
  opacity?: 'accent' | 'light' | 'dark';
}

export function Shimmer({ className, opacity = 'light' }: ShimmerProps) {
  const opacityClass =
    opacity === 'accent'
      ? 'bg-white/45'
      : opacity === 'dark'
      ? 'bg-white/22'
      : 'bg-white/35';

  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-y-0 left-0 w-[38%] -skew-x-12 blur-lg transition-transform duration-700 ease-out -translate-x-[140%] group-hover:translate-x-[320%]',
        opacityClass,
        className,
      )}
    />
  );
}
