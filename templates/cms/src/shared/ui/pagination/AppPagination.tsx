import {
  QUERY_DEFAULT_PAGE,
  QUERY_VIEW_DEFAULT_PAGE_SIZE,
  QUERY_VIEW_PAGE_SIZE_OPTIONS,
} from '@/configs/core/ui-policy.config';
import { cn } from '@/shared/utils/cn.util';
import { Pagination, type PaginationProps } from 'antd';

export interface AppPaginationProps extends PaginationProps {
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  containerClassName?: string;
}

export function AppPagination({
  page = QUERY_DEFAULT_PAGE,
  pageSize = QUERY_VIEW_DEFAULT_PAGE_SIZE,
  total = 0,
  onPageChange,
  containerClassName,
  className,
  ...props
}: Readonly<AppPaginationProps>) {
  return (
    <div
      className={cn(
        'text-muted-foreground flex w-full flex-wrap items-center justify-between gap-3 py-2 text-xs',
        containerClassName,
      )}
    >
      <Pagination
        size='small'
        align='end'
        current={Number(page)}
        pageSize={Number(pageSize)}
        total={Number(total)}
        pageSizeOptions={[...QUERY_VIEW_PAGE_SIZE_OPTIONS]}
        onChange={onPageChange}
        showTotal={(totalCount: number, [start, end]: [number, number]) =>
          totalCount > 0 ? `Showing ${start}–${end} of ${totalCount}` : ''
        }
        showSizeChanger
        showLessItems
        className={cn('m-0!', className)}
        {...props}
      />
    </div>
  );
}
