import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn.util';
import { Shimmer } from './Shimmer';

const buttonVariants = cva(
  'group relative overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none border-none',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white shadow-md shadow-accent/25 hover:bg-accent-press hover:shadow-lg active:scale-[0.98]',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs',
        outline: 'border border-border/80 bg-transparent text-foreground hover:border-accent/40 hover:bg-accent/10 hover:text-accent shadow-xs',
        ghost: 'text-foreground hover:bg-accent/10 hover:text-accent',
        glass: 'border border-amber-400/25 bg-amber-500/10 text-white backdrop-blur-md hover:border-amber-400/50 hover:bg-amber-500/20 hover:text-amber-200 shadow-xs',
        dark: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md',
        link: 'text-accent underline-offset-4 hover:underline p-0 h-auto font-normal overflow-visible',
      },
      size: {
        default: 'h-11 sm:h-12 px-5 sm:px-6 text-xs sm:text-sm font-bold',
        sm: 'h-9 px-3.5 text-xs font-semibold',
        lg: 'h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8.5 w-8.5 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  shimmer?: boolean;
  shimmerOpacity?: 'accent' | 'light' | 'dark';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      shimmer = variant === 'default',
      shimmerOpacity = 'light',
      children,
      ...props
    },
    ref,
  ) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {shimmer && variant !== 'link' && variant !== 'ghost' && (
          <Shimmer opacity={shimmerOpacity} />
        )}
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
