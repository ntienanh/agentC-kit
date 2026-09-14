import * as React from 'react';
import { cn } from '@/shared/utils/cn.util';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn('flex h-12 w-full rounded-2xl border border-input bg-card px-4 py-2 text-sm text-foreground shadow-[inset_0_2px_8px_rgba(17,24,39,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/25', className)}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
