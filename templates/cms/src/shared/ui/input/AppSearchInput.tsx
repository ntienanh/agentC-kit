'use client';

import { useDebounceCallback } from '@/shared/hooks/data/useDebounceCallback';
import { useNuqsSearchState } from '@/shared/hooks/data/useNuqsSearchState';
import { cn } from '@/shared/utils/cn.util';
import { Input, type InputProps } from 'antd';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface AppSearchInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  queryKey?: string;
  defaultValue?: string;
  debounceMs?: number;
  onSearchChange?: (value: string) => void;
}

export function AppSearchInput({
  queryKey = 'search',
  defaultValue = '',
  debounceMs = 300,
  placeholder = 'Search…',
  onSearchChange,
  className,
  ...props
}: AppSearchInputProps) {
  const [searchUrlValue, setSearchUrlValue] = useNuqsSearchState(queryKey, defaultValue);
  const [localValue, setLocalValue] = useState<string>(searchUrlValue ?? '');

  useEffect(() => {
    setLocalValue(searchUrlValue ?? '');
  }, [searchUrlValue]);

  const debouncedUpdateUrl = useDebounceCallback((nextValue: string) => {
    void setSearchUrlValue(nextValue.trim() ? nextValue : null);
    onSearchChange?.(nextValue);
  }, debounceMs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    debouncedUpdateUrl(val);
  };

  const handleClear = () => {
    setLocalValue('');
    void setSearchUrlValue(null);
    onSearchChange?.('');
  };

  return (
    <Input
      aria-label={props['aria-label'] ?? placeholder}
      value={localValue}
      onChange={handleChange}
      onClear={handleClear}
      placeholder={placeholder}
      prefix={<Search size={16} className='text-muted-foreground me-1' aria-hidden='true' />}
      className={cn('w-full h-9.5 rounded-lg text-sm focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all', className)}
      allowClear
      {...props}
    />
  );
}
