const apiFetch = fetch;
'use client';

import { ACTION_COLORS } from '@/shared/rbac';
import { AppModal } from '@/shared/ui/modal/AppModal';
import { AppButton } from '@/shared/ui/button/AppButton';
import { AppCard } from '@/shared/ui/card/AppCard';
import { AppSearchInput } from '@/shared/ui/input/AppSearchInput';
import { AppPageHeader } from '@/shared/ui/page/AppPageHeader';
import { AppTable } from '@/shared/ui/table/AppTable';
import { Empty, Pagination, Select, Tag, Typography } from 'antd';
import { Plus, RefreshCw } from 'lucide-react';
import { usePermissionsLogic } from '@/logic/permissions/usePermissionsLogic';
import { PermissionForm } from './PermissionForm';

export function PermissionList() {
  const {
    canCreate,
    isLoading,
    isFetching,
    refetch,
    search,
    resourceFilter,
    setResourceFilter,
    resourceOptions,
    page,
    setPage,
    limit,
    setLimit,
    total,
    paginatedPermissions,
    columns,
    editingPermission,
    setEditingPermission,
    showCreateModal,
    setShowCreateModal,
    handleUpdate,
    handleCreate,
    isUpdating,
    isCreating,
  } = usePermissionsLogic();

  return (
    <div className='content-spacing space-y-6'>
      <AppPageHeader
        title='Permissions'
        description='Manage and govern permission mappings, target resource definitions, and global capability scopes.'
        actions={
          <div className='flex items-center gap-2'>
            <AppButton icon={<RefreshCw size={15} />} onClick={() => refetch()} loading={isLoading || isFetching}>
              Refresh
            </AppButton>
            {canCreate && (
              <AppButton type='primary' icon={<Plus size={15} />} onClick={() => setShowCreateModal(true)}>
                Create Permission
              </AppButton>
            )}
          </div>
        }
      />

      <AppCard padding='sm' className='bg-card/90 border-border/50 rounded-xl shadow-xs backdrop-blur-md'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-3 sm:flex-nowrap'>
            <div className='w-full sm:w-72'>
              <AppSearchInput placeholder='Search permissions...' />
            </div>
            {resourceOptions.length > 0 && (
              <Select
                value={resourceFilter || undefined}
                onChange={val => {
                  void setResourceFilter(val || null);
                  setPage(1);
                }}
                placeholder='Filter by resource'
                options={resourceOptions}
                allowClear
                className='h-9.5 w-48 shrink-0'
              />
            )}
          </div>

          <div className='flex flex-wrap items-center justify-end gap-3 sm:flex-nowrap'>
            {total > 0 && (
              <>
                <Typography.Text className='text-muted-foreground text-xs leading-none font-medium whitespace-nowrap'>
                  Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
                </Typography.Text>
                <Pagination
                  current={page}
                  pageSize={limit}
                  total={total}
                  onChange={(p, s) => {
                    setPage(p);
                    setLimit(s);
                  }}
                  showSizeChanger
                  pageSizeOptions={['10', '20', '50', '100']}
                  className='flex items-center gap-2'
                />
              </>
            )}
          </div>
        </div>

        <AppTable
          ariaLabel='Permissions table'
          rowKey='id'
          dataSource={paginatedPermissions}
          columns={columns}
          loading={isLoading}
          pagination={false}
          size='small'
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={search ? 'No permissions match your search.' : 'No permissions found.'}
              />
            ),
          }}
        />
      </AppCard>

      <AppModal
        title='Edit permission'
        open={Boolean(editingPermission)}
        onClose={() => setEditingPermission(null)}
      >
        {editingPermission && (
          <>
            <div className='mb-4 flex items-center gap-2'>
              <Tag variant={'filled'} color='default' className='font-mono'>
                {editingPermission.resource}
              </Tag>
              <Tag
                variant={'filled'}
                color={ACTION_COLORS[editingPermission.action as keyof typeof ACTION_COLORS] ?? 'default'}
                className='font-mono'
              >
                {editingPermission.action}
              </Tag>
            </div>
            <PermissionForm
              initialValues={{
                name: editingPermission.name,
                description: editingPermission.description ?? undefined,
              }}
              onSubmit={handleUpdate}
              loading={isUpdating}
              isEdit
            />
          </>
        )}
      </AppModal>

      <AppModal
        title='Create new permission'
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <PermissionForm
          onSubmit={handleCreate}
          loading={isCreating}
        />
      </AppModal>
    </div>
  );
}
