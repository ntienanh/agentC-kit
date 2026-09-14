'use client';

import { AppSearchInput } from '@/shared/ui/input/AppSearchInput';
import { Pagination, Segmented, Typography, type SegmentedProps } from 'antd';
import type { ReactNode } from 'react';

export interface AppTableToolbarPagination {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
}

export interface AppTableToolbarProps {
  search?: {
    placeholder?: string;
    queryKey?: string;
    onSearchChange?: (val: string) => void;
    className?: string;
  } | ReactNode;

  filters?: ReactNode;

  segmented?: {
    value: string | number;
    onChange: (val: string | number) => void;
    options: SegmentedProps['options'];
    className?: string;
  };

  actions?: ReactNode;

  pagination?: AppTableToolbarPagination | ReactNode;

  className?: string;
}

export function AppTableToolbar({
  search,
  filters,
  segmented,
  actions,
  pagination,
  className = '',
}: Readonly<AppTableToolbarProps>) {
  const renderSearch = () => {
    if (!search) return null;
    if (typeof search === 'object' && !('type' in search && 'props' in search)) {
      const searchProps = search as {
        placeholder?: string;
        queryKey?: string;
        onSearchChange?: (val: string) => void;
        className?: string;
      };
      return (
        <div className='w-full shrink-0 sm:w-72'>
          <AppSearchInput
            placeholder={searchProps.placeholder || 'Search...'}
            queryKey={searchProps.queryKey}
            onSearchChange={searchProps.onSearchChange}
            className={searchProps.className}
          />
        </div>
      );
    }
    return <div className='w-full shrink-0 sm:w-72'>{search as ReactNode}</div>;
  };

  const renderPagination = () => {
    if (!pagination) return null;
    if (typeof pagination === 'object' && 'total' in pagination) {
      const {
        page,
        limit,
        total,
        onPageChange,
        pageSizeOptions = ['10', '20', '50', '100'],
        showSizeChanger = true,
      } = pagination as AppTableToolbarPagination;

      if (total <= 0) return null;

      const from = Math.min((page - 1) * limit + 1, total);
      const to = Math.min(page * limit, total);

      return (
        <>
          <Typography.Text className='text-muted-foreground text-xs leading-none font-medium whitespace-nowrap me-1'>
            Showing {from}–{to} of {total}
          </Typography.Text>
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            onChange={onPageChange}
            showSizeChanger={showSizeChanger}
            pageSizeOptions={pageSizeOptions}
            className='flex items-center gap-2'
          />
        </>
      );
    }
    return pagination as ReactNode;
  };

  return (
    <div className={`mb-4 flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className='flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:flex-nowrap'>
        {renderSearch()}
        {filters}
        {segmented && (
          <Segmented
            value={segmented.value}
            onChange={val => segmented.onChange(val as string | number)}
            options={segmented.options}
            className={segmented.className}
          />
        )}
      </div>

      {(actions || pagination) && (
        <div className='ms-auto flex shrink-0 flex-wrap items-center justify-end gap-3 sm:flex-nowrap'>
          {actions}
          {renderPagination()}
        </div>
      )}
    </div>
  );
}
