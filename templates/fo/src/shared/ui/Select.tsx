'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn.util';

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLabel?: React.ReactNode;
  setSelectedLabel: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a <Select />');
  }
  return context;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Select({
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  children,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '');
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState<React.ReactNode>(null);

  const isControlledValue = controlledValue !== undefined;
  const value = isControlledValue ? controlledValue : uncontrolledValue;

  const isControlledOpen = controlledOpen !== undefined;
  const open = isControlledOpen ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean | ((prev: boolean) => boolean)) => {
      const resolved = typeof nextOpen === 'function' ? nextOpen(open) : nextOpen;
      if (!isControlledOpen) {
        setUncontrolledOpen(resolved);
      }
      onOpenChange?.(resolved);
    },
    [isControlledOpen, onOpenChange, open],
  );

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlledValue) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
      setOpen(false);
    },
    [isControlledValue, onValueChange, setOpen],
  );

  const contextValue = React.useMemo(
    () => ({
      value,
      onValueChange: handleValueChange,
      open,
      setOpen,
      selectedLabel,
      setSelectedLabel,
    }),
    [value, handleValueChange, open, setOpen, selectedLabel],
  );

  return <SelectContext.Provider value={contextValue}>{children}</SelectContext.Provider>;
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelectContext();
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

  return (
    <button
      ref={triggerRef}
      type='button'
      role='combobox'
      aria-expanded={open}
      onClick={() => setOpen((prev) => !prev)}
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-2xl border border-input bg-background/80 px-4 py-2 text-sm shadow-inner shadow-white/40 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4 opacity-60 transition-transform', open && 'rotate-180')} />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

export function SelectValue({ placeholder, className, ...props }: SelectValueProps) {
  const { value, selectedLabel } = useSelectContext();

  return (
    <span className={cn('block truncate', !value && 'text-muted-foreground', className)} {...props}>
      {selectedLabel ?? value ?? placeholder}
    </span>
  );
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelectContext();
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  React.useEffect(() => {
    if (!open) return;
    const handleDocumentClick = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role='listbox'
      className={cn(
        'relative z-50 mt-1 max-h-96 min-w-32 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl p-1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = 'SelectContent';

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setSelectedLabel } = useSelectContext();
    const isSelected = selectedValue === value;

    React.useEffect(() => {
      if (isSelected && children) {
        setSelectedLabel(children);
      }
    }, [isSelected, children, setSelectedLabel]);

    return (
      <div
        ref={ref}
        role='option'
        aria-selected={isSelected}
        data-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled && onValueChange) {
            onValueChange(value);
          }
        }}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-xl py-2 pl-9 pr-3 text-sm outline-none transition-colors hover:bg-secondary focus:bg-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          isSelected && 'bg-secondary/70 font-semibold',
          className,
        )}
        {...props}
      >
        <span className='absolute left-3 flex h-3.5 w-3.5 items-center justify-center'>
          {isSelected && <Check className='h-4 w-4 text-primary' />}
        </span>
        <span className='truncate'>{children}</span>
      </div>
    );
  },
);
SelectItem.displayName = 'SelectItem';
