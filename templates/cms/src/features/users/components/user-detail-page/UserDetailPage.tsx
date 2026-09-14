'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { AppButton } from '@/shared/ui/button/AppButton';
import { AppCard } from '@/shared/ui/card/AppCard';
import { AppStatusTag } from '@/shared/ui/status/AppStatusTag';
import { Button, Result, Skeleton, Tabs, Typography } from 'antd';
import type { TabsProps } from 'antd';
import { ArrowLeft, Edit } from 'lucide-react';
import type { SessionInfo } from '../../models';
import { UserDangerZone } from './UserDangerZone';
import { UserEditModal } from './UserEditModal';
import { UserSessionList } from './UserSessionList';
import { useUserDetailPage } from './useUserDetailPage';

export function UserDetailPage({ id }: Readonly<{ id: string }>) {
  const {
    router,
    user,
    isLoading,
    isError,
    canUpdateUser,
    canDeleteUser,
    isSelf,
    editModalOpen,
    setEditModalOpen,
    activeTab,
    setActiveTab,
    handleEditSubmit,
    handleRevokeSession,
    handleDeleteUser,
    handleRestoreUser,
    updateUser,
    changeRole,
    deleteUser,
    restoreUser,
    revokeUserSession,
  } = useUserDetailPage(id);

  if (isLoading) {
    return (
      <div className='content-spacing h-full space-y-6'>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <Result
        status='404'
        title='User Not Found'
        subTitle='The requested user account does not exist or has been removed.'
        extra={<Button onClick={() => router.push(APP_HREFS.USERS)}>Back to Users</Button>}
      />
    );
  }

  const userSessions = ('sessions' in user && Array.isArray((user as { sessions?: SessionInfo[] }).sessions))
    ? ((user as { sessions: SessionInfo[] }).sessions)
    : [];

  return (
    <div className='content-spacing h-full space-y-6'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button icon={<ArrowLeft size={16} />} onClick={() => router.push(APP_HREFS.USERS)}>
            Back
          </Button>
          <div>
            <Typography.Title level={4} className='m-0 font-bold'>
              {user.displayName || user.email}
            </Typography.Title>
            <Typography.Text type='secondary' className='text-xs'>
              ID: {user.id}
            </Typography.Text>
          </div>
        </div>
        {canUpdateUser && (
          <AppButton
            type='primary'
            icon={<Edit size={16} />}
            onClick={() => setEditModalOpen(true)}
            data-testid='btn-edit-user'
          >
            Edit User
          </AppButton>
        )}
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <AppCard className='md:col-span-1'>
          <div className='space-y-4'>
            <div className='flex flex-col items-center py-4 text-center'>
              <div className='mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600'>
                {(user.displayName || user.email)[0].toUpperCase()}
              </div>
              <Typography.Title level={5} className='m-0 font-semibold'>
                {user.displayName || user.email}
              </Typography.Title>
              <Typography.Text type='secondary' className='text-xs'>
                {user.email}
              </Typography.Text>
              <div className='mt-2'>
                <AppStatusTag tone={user.deletedAt ? 'default' : 'success'}>
                  {user.deletedAt ? 'Inactive' : 'Active'}
                </AppStatusTag>
              </div>
            </div>

            <div className='space-y-2 border-t pt-4 text-xs'>
              <div className='flex justify-between'>
                <span className='text-neutral-500'>Role:</span>
                <span className='font-medium'>{user.role?.name || 'N/A'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-neutral-500'>Email Verified:</span>
                <span className='font-medium'>{user.emailVerified ? 'Yes' : 'No'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-neutral-500'>Phone:</span>
                <span className='font-medium'>{user.phone || 'N/A'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-neutral-500'>Joined:</span>
                <span className='font-medium'>{user.createdAt || 'N/A'}</span>
              </div>
            </div>
          </div>
        </AppCard>

        <div className='md:col-span-2'>
          <AppCard>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={
                ([
                  {
                    key: 'sessions',
                    label: 'Active Sessions',
                    children: (
                      <UserSessionList
                        userId={user.id}
                        sessions={userSessions}
                        onRevoke={handleRevokeSession}
                        loading={revokeUserSession.isPending}
                      />
                    ),
                  },
                  canDeleteUser && !isSelf
                    ? {
                        key: 'danger',
                        label: 'Danger Zone',
                        children: (
                          <div className='py-4'>
                            <UserDangerZone
                              user={user}
                              isSelf={isSelf}
                              onDelete={handleDeleteUser}
                              onRestore={handleRestoreUser}
                              loading={deleteUser.isPending || restoreUser.isPending}
                            />
                          </div>
                        ),
                      }
                    : null,
                ].filter(Boolean) as TabsProps['items'])
              }
            />
          </AppCard>
        </div>
      </div>

      {editModalOpen && (
        <UserEditModal
          open={editModalOpen}
          user={user}
          isSelf={isSelf}
          loading={updateUser.isPending || changeRole.isPending}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
