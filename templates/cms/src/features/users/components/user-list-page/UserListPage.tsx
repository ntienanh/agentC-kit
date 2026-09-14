const apiFetch = fetch;
'use client';

import { AppButton } from '@/shared/ui/button/AppButton';
import { AppCard } from '@/shared/ui/card/AppCard';
import { AppSearchInput } from '@/shared/ui/input/AppSearchInput';
import { AppPageHeader } from '@/shared/ui/page/AppPageHeader';
import { AppTable } from '@/shared/ui/table/AppTable';
import { Empty } from 'antd';
import { Plus, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { UserCreateModal } from '../user-create-modal/UserCreateModal';
import { UserEditModal } from '../user-detail-page/UserEditModal';
import { useUserListPage } from './useUserListPage';
import { getUserListColumns } from './utils/user-list.column';

export function UserListPage() {
  const {
    t,
    canCreate,
    canUpdate,
    isMutating,
    createModalOpen,
    setCreateModalOpen,
    editingUser,
    setEditingUser,
    handleEditSubmit,
    handleForceLogout,
    currentUser,
    users,
    pagination,
    isLoading,
    isFetching,
    refetch,
    search,
  } = useUserListPage();

  const columns = useMemo(
    () =>
      getUserListColumns(t, {
        onEdit: canUpdate ? user => setEditingUser(user) : undefined,
        onForceLogout: user => handleForceLogout(user),
      }),
    [canUpdate, handleForceLogout, setEditingUser, t],
  );

  return (
    <div className='content-spacing h-full space-y-6'>
      <AppPageHeader
        title='User Management'
        description='Manage accounts, global roles, store assignments, and sessions.'
        actions={
          <div className='flex items-center gap-2'>
            <AppButton icon={<RefreshCw size={15} />} onClick={() => refetch()} loading={isLoading || isFetching}>
              Refresh
            </AppButton>
            {canCreate && (
              <AppButton type='primary' icon={<Plus size={15} />} onClick={() => setCreateModalOpen(true)}>
                New User
              </AppButton>
            )}
          </div>
        }
      />

      <AppCard padding='sm' className='shadow-xs!'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div className='w-full max-w-md min-w-[240px] flex-1 sm:w-80'>
            <AppSearchInput placeholder='Search user email, display name, role...' />
          </div>
        </div>

        <AppTable
          ariaLabel='User management directory'
          rowKey='id'
          loading={isLoading}
          columns={columns}
          dataSource={users}
          pagination={
            pagination
              ? {
                  current: pagination.page,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                }
              : false
          }
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={search ? 'No users match the current search.' : 'No users found.'}
              />
            ),
          }}
        />
      </AppCard>

      <UserCreateModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />

      {editingUser && (
        <UserEditModal
          open={Boolean(editingUser)}
          user={editingUser}
          isSelf={String(currentUser?.id) === String(editingUser.id)}
          loading={isMutating}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
