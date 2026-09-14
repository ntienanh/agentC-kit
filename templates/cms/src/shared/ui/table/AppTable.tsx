import { ErrorBoundary } from '@/shared/ui/error/ErrorBoundary';
import { cn } from '@/shared/utils/cn.util';
import { Table, type TableProps } from 'antd';
import { Loader2 } from 'lucide-react';

const DEFAULT_TABLE_SCROLL = { x: 'max-content' } as const;

const TABLE_CLASS_NAME =
  '[&_.ant-pagination]:px-4! [&_.ant-pagination-total-text]:text-sm! [&_.ant-pagination-total-text]:font-medium! [&_.ant-pagination-total-text]:text-muted-foreground! [&_.ant-pagination-total-text]:me-3! [&_.ant-table-cell]:align-middle [&_.ant-table-cell]:tabular-nums [&_.ant-table-cell]:px-3! [&_.ant-table-cell]:py-3! [&_.ant-table-cell]:text-sm! [&_.ant-table-cell]:leading-normal! [&_.ant-table-thead_.ant-table-cell]:bg-muted! [&_.ant-table-thead_.ant-table-cell]:font-medium! [&_.ant-table-thead_.ant-table-cell]:py-3! [&_.ant-table-thead_.ant-table-cell]:text-sm! [&_.ant-table-thead_.ant-table-cell]:leading-normal! [&_td.ant-table-cell-fix-left]:bg-card! [&_td.ant-table-cell-fix-right]:bg-card! [&_th.ant-table-cell-fix-left]:bg-muted! [&_th.ant-table-cell-fix-right]:bg-muted! [&_.ant-table-tbody_tr:hover_td.ant-table-cell-fix-left]:bg-accent/40! [&_.ant-table-tbody_tr:hover_td.ant-table-cell-fix-right]:bg-accent/40! [&_.ant-spin-nested-loading_.ant-spin-blur]:opacity-40 [&_.ant-spin-nested-loading_.ant-spin-blur]:filter-none [&_.ant-table-container]:rounded-md! [&_.ant-table]:rounded-md! [&_.ant-table-container]:overflow-hidden! [&_.ant-table-content]:overflow-x-auto!';

export interface BulkActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedKeys: (string | number)[]) => void;
  danger?: boolean;
}

export interface AppTableProps<RecordType extends object = object> extends TableProps<RecordType> {
  ariaLabel?: string;
  containerClassName?: string;
  bulkActions?: BulkActionItem[];
}

export function AppTable<RecordType extends object = object>({
  className,
  containerClassName,
  ariaLabel,
  bordered = true,
  pagination,
  scroll,
  loading,
  bulkActions,
  rowSelection,
  ...props
}: Readonly<AppTableProps<RecordType>>) {
  const selectedKeys = (rowSelection?.selectedRowKeys ?? []) as (string | number)[];
  const hasSelections = selectedKeys.length > 0;

  const resolvedPagination: TableProps<RecordType>['pagination'] =
    pagination === false
      ? false
      : {
          position: ['topRight', 'bottomRight'],
          showLessItems: true,
          showSizeChanger: true,
          hideOnSinglePage: false,
          size: 'small',
          showTotal: (total: number, [start, end]: [number, number]) =>
            total > 0 ? `Showing ${start}–${end} of ${total}` : '',
          ...pagination,
        };

  const isSpinning = typeof loading === 'boolean' ? loading : loading?.spinning;
  const resolvedLoading = isSpinning
    ? {
        spinning: true,
        delay: 150,
        indicator: <Loader2 className='text-primary animate-spin' size={24} />,
        ...(typeof loading === 'object' ? loading : {}),
      }
    : undefined;

  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        'border-border/50 bg-card relative w-full overflow-hidden overflow-x-auto rounded-md border shadow-2xs',
        containerClassName,
      )}
      data-cms-table='true'
      role={ariaLabel ? 'region' : undefined}
      tabIndex={ariaLabel ? 0 : undefined}
    >
      <ErrorBoundary>
        <Table<RecordType>
          {...props}
          rowSelection={rowSelection}
          bordered={bordered}
          className={cn('w-full', TABLE_CLASS_NAME, className)}
          pagination={resolvedPagination}
          scroll={{ ...DEFAULT_TABLE_SCROLL, ...scroll }}
          size='small'
          loading={resolvedLoading}
        />
      </ErrorBoundary>

      {hasSelections && bulkActions && bulkActions.length > 0 ? (
        <div className='border-primary/30 bg-card/95 animate-in fade-in slide-in-from-bottom-2 sticky bottom-3 z-20 mx-auto my-2 flex w-max items-center gap-3 rounded-lg border px-4 py-2.5 shadow-xl backdrop-blur-md transition-all'>
          <span className='text-primary text-xs font-semibold'>
            {selectedKeys.length} item{selectedKeys.length > 1 ? 's' : ''} selected
          </span>
          <div className='bg-border h-4 w-px' />
          <div className='flex items-center gap-2'>
            {bulkActions.map(action => (
              <button
                key={action.label}
                type='button'
                onClick={() => action.onClick(selectedKeys)}
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  action.danger
                    ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                    : 'bg-primary/10 text-primary hover:bg-primary/20',
                )}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
