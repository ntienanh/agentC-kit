const apiFetch = fetch;
'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useAppRouter } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { AppActionsDropdown } from '@/shared/ui/button/AppActionsDropdown';
import { AppButton } from '@/shared/ui/button/AppButton';
import { AppCard } from '@/shared/ui/card/AppCard';
import { AppSearchInput } from '@/shared/ui/input/AppSearchInput';
import { AppWorkflowLink } from '@/shared/ui/navigation/AppWorkflowLink';
import { AppPageHeader } from '@/shared/ui/page/AppPageHeader';
import { AppStatusTag } from '@/shared/ui/status/AppStatusTag';
import { AppTable } from '@/shared/ui/table/AppTable';
import dayjs from '@/shared/utils/dayjs.util';
import { Drawer, Empty, Pagination, Typography, type MenuProps } from 'antd';
import { ExternalLink, Eye, KeyRound, LockKeyhole, PencilLine, Plus, RefreshCw, Shield, Trash2, UserCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useRolesLogic } from '@/logic/roles/useRolesLogic';
import type { RoleListItem } from '../models';
import { RoleCreateModal } from './RoleCreateModal';

function localizeHref(href: string, locale: string) {
  return href.startsWith(`/${locale}/`) ? href : `/${locale}${href}`;
}

function RoleTypeTag({
  isSystem,
  systemLabel,
  customLabel,
}: Readonly<{ isSystem: boolean; systemLabel: string; customLabel: string }>) {
  return <AppStatusTag tone={isSystem ? 'info' : 'primary'}>{isSystem ? systemLabel : customLabel}</AppStatusTag>;
}

export function RoleList() {
  const router = useAppRouter();
  const t = useI18n('features.roles');

  const {
    paginatedRoles,
    total,
    isLoading,
    isFetching,
    refetch,
    showCreateModal,
    setShowCreateModal,
    selectedRole,
    drawerOpen,
    setDrawerOpen,
    search,
    page,
    setPage,
    limit,
    setLimit,
    canCreateRole,
    canDeleteRole,
    canUpdate,
    canReadPermissions,
    handleDeleteRole,
    openDetailDrawer,
  } = useRolesLogic();

  const selectedRoleDetailHref = selectedRole
    ? localizeHref(APP_HREFS.ROLE_DETAIL(selectedRole.id), router.locale)
    : localizeHref(APP_HREFS.ROLES, router.locale);
  const permissionsHref = localizeHref(APP_HREFS.PERMISSIONS, router.locale);

  const columns = useMemo(
    () => [
      {
        title: t('list.columns.role'),
        key: 'role',
        width: 360,
        render: (_value: unknown, role: RoleListItem) => (
          <div className='min-w-0 py-1'>
            <Typography.Text className='text-foreground! block! truncate text-sm! font-semibold!'>
              {role.name}
            </Typography.Text>
            <Typography.Text className='text-muted-foreground! mt-1 block! max-w-xl truncate text-xs!'>
              {role.description || t('list.noDescription')}
            </Typography.Text>
          </div>
        ),
      },
      {
        title: t('list.columns.classification'),
        dataIndex: 'isSystem',
        key: 'isSystem',
        width: 140,
        render: (isSystem: boolean) => (
          <RoleTypeTag isSystem={isSystem} systemLabel={t('list.system')} customLabel={t('list.custom')} />
        ),
      },
      {
        title: t('list.columns.permissions'),
        dataIndex: 'permissionCount',
        key: 'permissionCount',
        width: 135,
        render: (permissionCount: number) => (
          <span className='text-foreground inline-flex items-center gap-2 text-xs font-semibold tabular-nums'>
            <KeyRound size={14} className='text-muted-foreground' aria-hidden='true' />
            {permissionCount ?? 0}
          </span>
        ),
      },
      {
        title: t('list.columns.lastUpdated'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 165,
        render: (val: string) => (
          <span className='text-muted-foreground font-mono text-xs'>
            {dayjs(val).format('DD/MM/YYYY HH:mm')}
          </span>
        ),
      },
      {
        title: t('list.actions'),
        key: 'actions',
        width: 95,
        align: 'center' as const,
        fixed: 'right' as const,
        render: (_value: unknown, role: RoleListItem) => {
          const menuItems: MenuProps['items'] = [
            {
              key: 'detail',
              label: t('list.viewDetails'),
              icon: <Eye size={14} />,
              onClick: () => openDetailDrawer(role),
            },
            ...(canUpdate
              ? [
                  {
                    key: 'manage',
                    label: t('list.managePermissions'),
                    icon: <PencilLine size={14} />,
                    onClick: () => router.push(localizeHref(APP_HREFS.ROLE_DETAIL(role.id), router.locale)),
                  },
                ]
              : []),
            ...(canDeleteRole && !role.isSystem
              ? [
                  { key: 'd1', type: 'divider' as const },
                  {
                    key: 'delete',
                    label: t('list.deleteRole'),
                    icon: <Trash2 size={14} className='text-red-500' />,
                    danger: true,
                    onClick: () => handleDeleteRole(role),
                  },
                ]
              : []),
          ];

          return <AppActionsDropdown items={menuItems} />;
        },
      },
    ],
    [canDeleteRole, canUpdate, router, t, handleDeleteRole, openDetailDrawer],
  );

  return (
    <section aria-label={t('list.ariaLabel')} className='content-spacing space-y-6'>
      <AppPageHeader
        title={t('list.title')}
        description={t('list.description')}
        actions={
          <div className='flex items-center gap-2'>
            <AppButton icon={<RefreshCw size={15} />} onClick={() => refetch()} loading={isLoading || isFetching}>
              {t('list.refresh')}
            </AppButton>
            {canCreateRole && (
              <AppButton type='primary' icon={<Plus size={15} />} onClick={() => setShowCreateModal(true)}>
                {t('list.createRole')}
              </AppButton>
            )}
          </div>
        }
      />

      <AppCard padding='sm' className='bg-card/90 border-border/50 rounded-xl shadow-xs backdrop-blur-md'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-3 sm:flex-nowrap'>
            <div className='w-full sm:w-72'>
              <AppSearchInput placeholder={t('list.searchPlaceholder')} />
            </div>
          </div>

          <div className='flex flex-wrap items-center justify-end gap-3 sm:flex-nowrap'>
            {total > 0 && (
              <>
                <Typography.Text className='text-muted-foreground text-xs leading-none font-medium whitespace-nowrap'>
                  {t('list.pagination', { from: Math.min((page - 1) * limit + 1, total), to: Math.min(page * limit, total), total })}
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
          ariaLabel={t('list.ariaLabel')}
          rowKey='id'
          dataSource={paginatedRoles}
          columns={columns}
          loading={isLoading}
          pagination={false}
          size='small'
          onRow={record => ({
            onClick: () => openDetailDrawer(record as RoleListItem),
            className: 'cursor-pointer transition-colors hover:bg-muted/30',
          })}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={search ? t('list.noRolesMatchSearch') : t('list.noRolesFound')}
              />
            ),
          }}
        />
      </AppCard>

      <Drawer
        title={
          <span className='flex items-center gap-2 text-sm font-semibold'>
            <Shield size={16} className='text-primary' />
            {selectedRole?.name ?? t('list.roleDetails')}
            {selectedRole && (
              <RoleTypeTag
                isSystem={selectedRole.isSystem}
                systemLabel={t('list.system')}
                customLabel={t('list.custom')}
              />
            )}
          </span>
        }
        size={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedRole ? (
          <div className='space-y-6 text-xs'>
            <div className='bg-muted/30 space-y-2 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <div className='bg-primary/10 shrink-0 rounded-lg p-2.5'>
                  <Shield size={20} className='text-primary' />
                </div>
                <div className='min-w-0'>
                  <p className='text-foreground m-0 text-sm font-semibold'>{selectedRole.name}</p>
                  <p className='text-muted-foreground m-0 mt-0.5 text-xs'>
                    {selectedRole.description || t('list.noDescription')}
                  </p>
                </div>
              </div>
            </div>

            <div className='border-border/40 space-y-3 border-t pt-2'>
              <h4 className='text-muted-foreground m-0 text-[11px] font-semibold tracking-wider uppercase'>
                {t('list.roleInformation')}
              </h4>
              <dl className='grid grid-cols-2 gap-4 text-xs'>
                <div>
                  <dt className='text-muted-foreground text-[11px]'>{t('list.columns.classification')}</dt>
                  <dd className='mt-0.5'>
                    <RoleTypeTag
                      isSystem={selectedRole.isSystem}
                      systemLabel={t('list.system')}
                      customLabel={t('list.custom')}
                    />
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground flex items-center gap-1 text-[11px]'>
                    <KeyRound size={11} /> {t('list.columns.permissions')}
                  </dt>
                  <dd className='text-foreground mt-0.5 text-sm font-semibold tabular-nums'>
                    {selectedRole.permissionCount ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground text-[11px]'>{t('list.created')}</dt>
                  <dd className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
                    {dayjs(selectedRole.createdAt).format('DD/MM/YYYY HH:mm')}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground text-[11px]'>{t('list.columns.lastUpdated')}</dt>
                  <dd className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
                    {dayjs(selectedRole.updatedAt).format('DD/MM/YYYY HH:mm')}
                  </dd>
                </div>
                <div className='col-span-2'>
                  <dt className='text-muted-foreground text-[11px]'>{t('list.roleId')}</dt>
                  <dd className='text-foreground mt-0.5 truncate font-mono text-[11px]'>{selectedRole.id}</dd>
                </div>
              </dl>
            </div>

            <div className='border-border/40 space-y-2.5 border-t pt-2'>
              <h4 className='text-muted-foreground m-0 mb-2 text-[11px] font-semibold tracking-wider uppercase'>
                {t('list.guardrails.title')}
              </h4>
              <div className='border-border/30 flex items-center justify-between border-b py-1.5'>
                <div className='flex items-center gap-2'>
                  <PencilLine size={13} className='text-muted-foreground' />
                  <span className='text-muted-foreground text-[11px]'>{t('list.guardrails.permissionUpdates')}</span>
                </div>
                <span className='text-foreground text-xs font-semibold'>
                  {canUpdate ? t('list.metrics.enabled') : t('list.guardrails.readOnly')}
                </span>
              </div>
              <div className='border-border/30 flex items-center justify-between border-b py-1.5'>
                <div className='flex items-center gap-2'>
                  <UserCheck size={13} className='text-muted-foreground' />
                  <span className='text-muted-foreground text-[11px]'>{t('list.guardrails.roleCreation')}</span>
                </div>
                <span className='text-foreground text-xs font-semibold'>
                  {canCreateRole ? t('list.guardrails.superAdminOnly') : t('list.guardrails.unavailable')}
                </span>
              </div>
              <div className='flex items-center justify-between py-1.5'>
                <div className='flex items-center gap-2'>
                  <LockKeyhole size={13} className='text-muted-foreground' />
                  <span className='text-muted-foreground text-[11px]'>{t('list.guardrails.customRoleDeletion')}</span>
                </div>
                <span className='text-foreground text-xs font-semibold'>
                  {canDeleteRole ? t('list.guardrails.confirmationRequired') : t('list.metrics.protected')}
                </span>
              </div>
            </div>

            <div className='border-border/40 space-y-3 border-t pt-2'>
              <h4 className='text-muted-foreground m-0 mb-2 text-[11px] font-semibold tracking-wider uppercase'>
                {t('list.connectedWorkspaces')}
              </h4>
              <nav aria-label='Role workflow links' className='grid gap-2'>
                <AppWorkflowLink
                  href={selectedRoleDetailHref}
                  label={t('list.openRoleDetail')}
                  description={t('list.openRoleDetailDescription')}
                />
                {canReadPermissions && (
                  <AppWorkflowLink
                    href={permissionsHref}
                    label={t('list.guardrails.permissionCatalog')}
                    description={t('list.guardrails.permissionCatalogDescription')}
                  />
                )}
              </nav>
            </div>

            <div className='border-border/40 flex flex-col gap-2 border-t pt-2'>
              <AppButton
                block
                type='primary'
                icon={<ExternalLink size={14} />}
                onClick={() => router.push(selectedRoleDetailHref)}
              >
                {t('list.managePermissions')}
              </AppButton>
              {canDeleteRole && !selectedRole.isSystem && (
                <AppButton
                  block
                  danger
                  onClick={() => {
                    setDrawerOpen(false);
                    handleDeleteRole(selectedRole);
                  }}
                >
                  {t('list.deleteRole')}
                </AppButton>
              )}
            </div>
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('list.noRoleSelected')} />
        )}
      </Drawer>

      <RoleCreateModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </section>
  );
}
