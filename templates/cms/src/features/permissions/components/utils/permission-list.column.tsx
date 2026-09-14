'use client';

import { ACTION_COLORS } from '@/shared/rbac';
import { AppActionsDropdown } from '@/shared/ui/button/AppActionsDropdown';
import dayjs from '@/shared/utils/dayjs.util';
import { Popconfirm, Tag, Typography, type MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PencilLine, Trash2 } from 'lucide-react';
import type { PermissionItem } from '../../types';

const { Text } = Typography;
const PERMISSION_NAME_COLUMN_WIDTH = 140;
const PERMISSION_STANDARD_COLUMN_WIDTH = 120;

export function getPermissionListColumns(handlers?: {
  onEdit?: (item: PermissionItem) => void;
  onDelete?: (id: string) => void;
}): ColumnsType<PermissionItem> {
  const { onEdit, onDelete } = handlers ?? {};

  return [
    {
      title: 'Permission name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text code>{name}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | null) => (desc ? <Text type='secondary'>{desc}</Text> : <Text type='secondary'>—</Text>),
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      width: PERMISSION_NAME_COLUMN_WIDTH,
      render: (resource: string) => (
        <Tag variant={'filled'} color='default' className='font-mono'>
          {resource}
        </Tag>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: PERMISSION_STANDARD_COLUMN_WIDTH,
      render: (action: string) => (
        <Tag color={ACTION_COLORS[action as keyof typeof ACTION_COLORS] ?? 'default'} className='font-mono'>
          {action}
        </Tag>
      ),
    },
    {
      title: 'Created at',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: PERMISSION_STANDARD_COLUMN_WIDTH,
      render: (val: string) => (
        <Text type='secondary' className='text-sm'>
          {dayjs(val).format('YYYY-MM-DD')}
        </Text>
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
                  label: 'Edit permission',
                  icon: <PencilLine size={14} />,
                  onClick: () => onEdit(record),
                },
              ]
            : []),
          ...(onDelete
            ? [
                { key: 'd1', type: 'divider' as const },
                {
                  key: 'delete',
                  label: (
                    <Popconfirm
                      title='Delete permission'
                      description='Are you sure you want to delete this permission?'
                      onConfirm={() => onDelete(record.id)}
                      okText='Delete'
                      cancelText='Cancel'
                      okButtonProps={{ danger: true }}
                    >
                      <span className='block w-full text-red-500'>Delete permission</span>
                    </Popconfirm>
                  ),
                  icon: <Trash2 size={14} className='text-red-500' />,
                  danger: true,
                },
              ]
            : []),
        ];

        return <AppActionsDropdown items={menuItems} />;
      },
    },
  ];
}
