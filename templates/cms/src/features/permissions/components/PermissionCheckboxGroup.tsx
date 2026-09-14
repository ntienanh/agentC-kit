'use client';

import { AppTable } from '@/shared/ui/table/AppTable';
import { Checkbox, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import type { PermissionItem, PermissionsGrouped } from '../types';
import {
  applyColumnToggle,
  applyPermissionToggle,
  applyToggleAll,
  getRowCheckState,
  getVisibleActions,
  getVisibleColumnPermissionIds,
  getVisiblePermissionIds,
  getVisibleRowPermissionIds,
} from './permission-checkbox-group.logic';

interface PermissionCheckboxGroupProps {
  permissions: PermissionsGrouped;
  value?: string[];
  onChange?: (ids: string[]) => void;
  disabled?: boolean;
}

interface RowData {
  resource: string;
  items: PermissionItem[];
}

const PRIORITY_ACTIONS = ['read', 'create', 'update', 'delete'];
const PERMISSION_TOGGLE_COLUMN_WIDTH = 48;
const PERMISSION_RESOURCE_COLUMN_WIDTH = 140;
const PERMISSION_ACTION_COLUMN_WIDTH = 90;

export function PermissionCheckboxGroup({
  permissions,
  value = [],
  onChange,
  disabled,
}: Readonly<PermissionCheckboxGroupProps>) {
  const resources = Object.keys(permissions).sort();

  const allActions = useMemo(() => {
    const set = new Set<string>(getVisibleActions(permissions));
    const priority = PRIORITY_ACTIONS.filter(a => set.has(a));
    const rest = [...set].filter(a => !PRIORITY_ACTIONS.includes(a)).sort();
    return [...priority, ...rest];
  }, [permissions]);

  const toggle = (resource: string, action: string, id: string, checked: boolean) => {
    onChange?.(applyPermissionToggle(permissions, value, resource, action, id, checked));
  };

  const toggleRow = (resource: string, checked: boolean) => {
    const ids = getVisibleRowPermissionIds(permissions, resource);
    const next = checked ? [...new Set([...value, ...ids])] : value.filter(v => !ids.includes(v));
    onChange?.(next);
  };

  const toggleColumn = (action: string, checked: boolean) => {
    onChange?.(applyColumnToggle(permissions, value, action, checked));
  };

  const toggleAll = (checked: boolean) => {
    onChange?.(applyToggleAll(permissions, value, checked));
  };

  const allIds = getVisiblePermissionIds(permissions);
  const allChecked = allIds.length > 0 && allIds.every(id => value.includes(id));
  const allIndeterminate = !allChecked && allIds.some(id => value.includes(id));

  const columns: ColumnsType<RowData> = [
    {
      title: (
        <Checkbox
          indeterminate={allIndeterminate}
          checked={allChecked}
          disabled={disabled}
          onChange={e => toggleAll(e.target.checked)}
        />
      ),
      key: 'rowToggle',
      width: PERMISSION_TOGGLE_COLUMN_WIDTH,
      fixed: 'left',
      render: (_, record) => {
        const rowState = getRowCheckState(permissions, record.resource, value);
        return (
          <Checkbox
            indeterminate={rowState.indeterminate}
            checked={rowState.checked}
            disabled={disabled}
            onChange={e => toggleRow(record.resource, e.target.checked)}
          />
        );
      },
    },
    {
      title: (
        <Typography.Text type='secondary' style={{ fontSize: 12 }}>
          RESOURCE
        </Typography.Text>
      ),
      key: 'resource',
      width: PERMISSION_RESOURCE_COLUMN_WIDTH,
      fixed: 'left',
      render: (_, record) => (
        <Typography.Text strong className='capitalize'>
          {record.resource}
        </Typography.Text>
      ),
    },
    ...allActions.map(action => {
      const colIds = getVisibleColumnPermissionIds(permissions, action);
      const colChecked = colIds.length > 0 && colIds.every(id => value.includes(id));
      const colIndet = !colChecked && colIds.some(id => value.includes(id));

      return {
        title: (
          <div className='flex flex-col items-center gap-1'>
            <Typography.Text type='secondary' style={{ fontSize: 11, textTransform: 'uppercase' as const }}>
              {action}
            </Typography.Text>
            <Checkbox
              indeterminate={colIndet}
              checked={colChecked}
              disabled={disabled}
              onChange={e => toggleColumn(action, e.target.checked)}
            />
          </div>
        ),
        key: action,
        align: 'center' as const,
        width: PERMISSION_ACTION_COLUMN_WIDTH,
        render: (_: unknown, record: RowData) => {
          const perm = record.items.find(p => p.action === action);
          if (!perm) return <span className='text-muted-foreground/40'>—</span>;
          return (
            <Checkbox
              checked={value.includes(perm.id)}
              disabled={disabled}
              onChange={e => toggle(record.resource, action, perm.id, e.target.checked)}
            />
          );
        },
      };
    }),
  ];

  const dataSource: RowData[] = resources.map(resource => ({
    resource,
    items: permissions[resource] ?? [],
  }));

  return (
    <AppTable<RowData>
      ariaLabel='Permissions matrix'
      rowKey='resource'
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      size='small'
      bordered
      scroll={{ x: 'max-content' }}
      rowClassName={(_, index) => (index % 2 === 0 ? '' : 'bg-surface-subtle')}
    />
  );
}
