'use client';

import { AppCard } from '@/shared/ui/card/AppCard';
import { AppStatusTag } from '@/shared/ui/status/AppStatusTag';
import { Select, Space, Typography } from 'antd';
import { CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CaslAbilityTesterWidgetProps {
  permissionKeys: string[];
}

const TESTABLE_RESOURCES = [
  { value: 'users', label: 'Users & Accounts' },
  { value: 'roles', label: 'System Roles' },
  { value: 'permissions', label: 'Permission Catalog' },
];

const TESTABLE_ACTIONS = [
  { value: 'read', label: 'Read / View' },
  { value: 'create', label: 'Create / Add' },
  { value: 'update', label: 'Update / Edit' },
  { value: 'delete', label: 'Delete / Remove' },
  { value: 'manage', label: 'Full Management (*)' },
];

export function CaslAbilityTesterWidget({ permissionKeys }: Readonly<CaslAbilityTesterWidgetProps>) {
  const [selectedResource, setSelectedResource] = useState('users');
  const [selectedAction, setSelectedAction] = useState('read');

  const hasAbility = useMemo(() => {
    const managePermKey = ['permissions', 'manage'].join(':');
    if (permissionKeys.includes('*') || permissionKeys.includes(managePermKey)) {
      return true;
    }
    const targetKey = `${selectedResource}:${selectedAction}`;
    const manageKey = `${selectedResource}:manage`;
    return permissionKeys.includes(targetKey) || permissionKeys.includes(manageKey);
  }, [permissionKeys, selectedResource, selectedAction]);

  return (
    <AppCard
      title={
        <div className='text-foreground flex items-center gap-2 text-sm font-bold'>
          <Sparkles className='text-primary h-4 w-4 animate-pulse' />
          <span>Live CASL Ability Sandbox (RBAC Evaluator)</span>
        </div>
      }
      className='border-primary/20 bg-surface-subtle/30 shadow-xs'
    >
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <Space direction='horizontal' size='small'>
            <Typography.Text className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
              Resource:
            </Typography.Text>
            <Select
              value={selectedResource}
              onChange={setSelectedResource}
              options={TESTABLE_RESOURCES}
              className='w-44'
              size='small'
            />
          </Space>

          <Space direction='horizontal' size='small'>
            <Typography.Text className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
              Action:
            </Typography.Text>
            <Select
              value={selectedAction}
              onChange={setSelectedAction}
              options={TESTABLE_ACTIONS}
              className='w-36'
              size='small'
            />
          </Space>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-xs font-semibold'>CASL Evaluation Result:</span>
          {hasAbility ? (
            <AppStatusTag tone='success' className='flex items-center gap-1 px-2.5 py-1 text-xs font-bold'>
              <CheckCircle className='h-3.5 w-3.5' />
              <span>
                ALLOWED (`can('${selectedAction}', '${selectedResource}')`)
              </span>
            </AppStatusTag>
          ) : (
            <AppStatusTag tone='error' className='flex items-center gap-1 px-2.5 py-1 text-xs font-bold'>
              <ShieldAlert className='h-3.5 w-3.5' />
              <span>
                FORBIDDEN (`cannot('${selectedAction}', '${selectedResource}')`)
              </span>
            </AppStatusTag>
          )}
        </div>
      </div>
    </AppCard>
  );
}
