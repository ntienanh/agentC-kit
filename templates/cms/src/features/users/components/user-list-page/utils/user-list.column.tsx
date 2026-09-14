'use client';

import { AppActionsDropdown } from '@/shared/ui/button/AppActionsDropdown';
import { AppStatusTag } from '@/shared/ui/status/AppStatusTag';
import { CopyButton } from '@/shared/ui/button/CopyButton';
import dayjs from '@/shared/utils/dayjs.util';
import { Avatar, type MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LogOut, PencilLine } from 'lucide-react';
import type { PublicProfile } from '../../../models';

function maskId(id: string) {
  if (id.length <= 10) return id;
  return `${id.slice(0, 5)}****${id.slice(-6)}`;
}

export function getUserListColumns(
  t: (key: string) => string,
  handlers?: {
    onEdit?: (user: PublicProfile) => void;
    onForceLogout?: (user: PublicProfile) => void;
  },
): ColumnsType<PublicProfile> {
  const { onEdit, onForceLogout } = handlers ?? {};
  return [
    {
      title: '',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 50,
      align: 'center',
      render: (avatar: string | null, record) => {
        const fallbackLetter = (record.displayName?.[0] ?? record.email?.[0] ?? '?').toUpperCase();

        return (
          <Avatar
            src={avatar ?? undefined}
            size={30}
            className='bg-primary/10 text-primary border-primary/20 border align-middle text-xs font-bold shadow-2xs'
          >
            {avatar ? null : fallbackLetter}
          </Avatar>
        );
      },
    },
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id: string) => <CopyButton value={id} displayValue={maskId(String(id))} />,
    },
    {
      title: t('list.columns.email'),
      dataIndex: 'email',
      key: 'email',
      width: 220,
      ellipsis: true,
      render: (email: string) => <span className='text-foreground block truncate text-xs font-bold'>{email}</span>,
    },
    {
      title: t('list.columns.displayName'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: 180,
      ellipsis: true,
      render: (name: string | null) =>
        name ? (
          <span className='text-foreground block truncate text-xs font-medium'>{name}</span>
        ) : (
          <span className='text-muted-foreground text-xs font-medium'>—</span>
        ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: PublicProfile['role']) => {
        const roleName = role?.name?.toUpperCase() ?? 'USER';
        const tone = roleName.includes('ADMIN') ? 'primary' : roleName.includes('STAFF') ? 'info' : 'default';
        return (
          <AppStatusTag tone={tone} size='sm' className='font-bold'>
            {role?.name ?? 'User'}
          </AppStatusTag>
        );
      },
    },
    {
      title: t('list.columns.verification'),
      dataIndex: 'emailVerified',
      key: 'emailVerified',
      width: 130,
      render: (verified: boolean) => (
        <AppStatusTag tone={verified ? 'success' : 'warning'} size='sm' className='font-semibold'>
          {verified ? t('list.columns.verified') : t('list.columns.unverified')}
        </AppStatusTag>
      ),
    },
    {
      title: t('list.columns.status'),
      dataIndex: 'deletedAt',
      key: 'status',
      width: 100,
      render: (deletedAt: string | null) =>
        deletedAt === null ? (
          <AppStatusTag tone='success' size='sm' className='font-bold'>
            {t('list.columns.active')}
          </AppStatusTag>
        ) : (
          <AppStatusTag tone='error' size='sm' className='font-bold'>
            {t('list.columns.deleted')}
          </AppStatusTag>
        ),
    },
    {
      title: t('list.columns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <span className='text-muted-foreground font-mono text-xs font-medium'>{dayjs(date).format('DD/MM/YYYY')}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 95,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          ...(onEdit
            ? [
                {
                  key: 'edit',
                  label: 'Edit user profile',
                  icon: <PencilLine size={14} />,
                  onClick: () => onEdit(record),
                },
              ]
            : []),
          ...(onForceLogout
            ? [
                {
                  key: 'logout',
                  label: 'Revoke active sessions',
                  icon: <LogOut size={14} />,
                  onClick: () => onForceLogout(record),
                },
              ]
            : []),
        ];

        return <AppActionsDropdown items={menuItems} />;
      },
    },
  ];
}
