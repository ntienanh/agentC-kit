'use client';

import { Input, Segmented } from 'antd';
import { Search } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';

export interface AppFilterToolbarProps {
  segmented?: {
    value: string;
    onChange: (value: string) => void;
    options: Array<string | number | { label: ReactNode; value: string | number; disabled?: boolean }>;
    className?: string;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    onSearch?: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
  };
  filters?: ReactNode;
  actions?: ReactNode;
  pagination?: ReactNode;
  className?: string;
}

export function AppFilterToolbar({
  segmented,
  search,
  filters,
  actions,
  pagination,
  className = '',
}: Readonly<AppFilterToolbarProps>) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 md:flex-nowrap ${className}`}>
      <div className='flex min-w-0 flex-1 flex-wrap items-center gap-3'>
        {search && (
          <div className='w-64 shrink-0 sm:w-72'>
            <Input
              placeholder={search.placeholder || 'Search...'}
              prefix={<Search size={14} className='text-muted-foreground me-1 shrink-0' />}
              value={search.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => search.onChange(e.target.value)}
              onPressEnter={() => search.onSearch?.(search.value)}
              onBlur={() => search.onBlur?.()}
              allowClear
              className={`h-10 w-full rounded-lg text-sm ${search.className || ''}`}
            />
          </div>
        )}

        {filters}

        {segmented && (
          <Segmented
            value={segmented.value}
            onChange={val => segmented.onChange(String(val))}
            options={segmented.options}
            className={`shrink-0 ${segmented.className || ''}`}
          />
        )}
      </div>

      {(actions || pagination) && (
        <div className='[&_.ant-pagination-total-text]:text-muted-foreground ms-auto flex shrink-0 items-center gap-3 [&_.ant-pagination]:flex [&_.ant-pagination]:items-center [&_.ant-pagination-item]:h-9 [&_.ant-pagination-item]:min-w-9 [&_.ant-pagination-item]:rounded-lg [&_.ant-pagination-item]:text-sm [&_.ant-pagination-item]:leading-8 [&_.ant-pagination-next]:h-9 [&_.ant-pagination-next]:min-w-9 [&_.ant-pagination-next]:rounded-lg [&_.ant-pagination-options_.ant-select-selection-item]:leading-8! [&_.ant-pagination-options_.ant-select-selector]:h-9! [&_.ant-pagination-prev]:h-9 [&_.ant-pagination-prev]:min-w-9 [&_.ant-pagination-prev]:rounded-lg [&_.ant-pagination-total-text]:me-3 [&_.ant-pagination-total-text]:text-sm [&_.ant-pagination-total-text]:font-medium'>
          {actions}
          {pagination}
        </div>
      )}
    </div>
  );
}
