'use client';

import { useAntdMessage } from '@/shared/hooks/ui/useAntdMessage';
import { useI18n } from '@/shared/i18n';
import { PERMISSION_SUBJECTS, useCrudPermissions } from '@/shared/rbac';
import { AppButton } from '@/shared/ui/button/AppButton';
import { AppCard } from '@/shared/ui/card/AppCard';
import { AppStatusTag } from '@/shared/ui/status/AppStatusTag';
import { Alert, Descriptions, Skeleton, Tag, Typography } from 'antd';
import { CheckCircle2, Save, Shield } from 'lucide-react';
import { useMemo, useState } from 'react';
import { showErrorMessage } from '@/shared/lib/error';
import { PermissionCheckboxGroup } from '../../permissions/components/PermissionCheckboxGroup';
import { usePermissions } from '@/logic/permissions/usePermissionQueries';
import { useAssignPermissions, useRemovePermissions } from '@/logic/roles/useRoleMutations';
import { useRole } from '@/logic/roles/useRoleQueries';
import { CaslAbilityTesterWidget } from './CaslAbilityTesterWidget';

interface RoleDetailProps {
  id: string;
}

export function RoleDetail({ id }: Readonly<RoleDetailProps>) {
  const { role, isLoading: roleLoading, error: roleError } = useRole(id);
  const { permissions: permissionsGrouped, isLoading: permsLoading, error: permissionsError } = usePermissions();
  const { mutate: assignPermissions, isPending: assigning } = useAssignPermissions();
  const { mutate: removePermissions, isPending: removing } = useRemovePermissions();
  const message = useAntdMessage();
  const t = useI18n('features.roles');
  const tError = useI18n('error');
  const { canUpdate } = useCrudPermissions(PERMISSION_SUBJECTS.ROLES);

  const [selected, setSelected] = useState<string[] | null>(null);

  const rolePermissionIds = role?.permissions?.map(entry => entry.permissionId) ?? [];
  const currentSelected = selected ?? rolePermissionIds;
  const canEditPermissions = role !== null && canUpdate;
  const isModified = selected !== null;

  const handleSave = () => {
    if (!role) return;

    const original = rolePermissionIds;
    const toAdd = currentSelected.filter(permissionId => !original.includes(permissionId));
    const toRemove = original.filter(permissionId => !currentSelected.includes(permissionId));

    const doAssign = () => {
      if (toAdd.length === 0) return Promise.resolve();
      return new Promise<void>((resolve, reject) => {
        assignPermissions(
          { id: role.id, data: { permissionIds: toAdd } },
          { onSuccess: () => resolve(), onError: reject },
        );
      });
    };

    const doRemove = () => {
      if (toRemove.length === 0) return Promise.resolve();
      return new Promise<void>((resolve, reject) => {
        removePermissions(
          { id: role.id, data: { permissionIds: toRemove } },
          { onSuccess: () => resolve(), onError: reject },
        );
      });
    };

    doAssign()
      .then(doRemove)
      .then(() => {
        message.success(t('detail.permissionUpdatedSuccess'));
        setSelected(null);
      })
      .catch((err: unknown) => {
        showErrorMessage(message, err, tError, 'ROLE_PERMISSION_UPDATE_FAILED');
      });
  };

  const activePermissionKeys = useMemo(() => {
    const keys: string[] = [];
    Object.values(permissionsGrouped).forEach(items => {
      items.forEach(item => {
        if (currentSelected.includes(item.id)) {
          keys.push(`${item.resource}:${item.action}`);
        }
      });
    });
    return keys;
  }, [permissionsGrouped, currentSelected]);

  if (roleLoading || permsLoading) return <Skeleton active />;
  if (roleError || permissionsError) {
    return <Alert type='error' showIcon message={tError('PERMISSION_UPDATE_FAILED')} />;
  }
  if (!role) return <Typography.Text type='danger'>{t('detail.notFound')}</Typography.Text>;

  return (
    <div className='flex flex-col gap-6'>
      <AppCard
        title={
          <div className='flex items-center gap-2'>
            <Shield size={18} className='text-primary' aria-hidden='true' />
            <span className='text-foreground font-semibold'>{t('detail.overviewTitle')}</span>
          </div>
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }} size='small'>
          <Descriptions.Item label={t('detail.roleName')}>
            <Typography.Text strong>{role.name}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('detail.description')}>
            {role.description ?? <Typography.Text type='secondary'>—</Typography.Text>}
          </Descriptions.Item>
          <Descriptions.Item label={t('detail.type')}>
            <AppStatusTag tone='info'>{t('detail.permissionsCount', { count: currentSelected.length })}</AppStatusTag>
          </Descriptions.Item>
        </Descriptions>
      </AppCard>

      <AppCard
        title={
          <div className='flex flex-wrap items-center justify-between gap-3 py-1'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 size={18} className='text-primary' aria-hidden='true' />
              <span className='text-foreground font-bold'>{t('detail.permissionsTitle')}</span>
              {isModified && (
                <Tag color='gold' className='m-0! rounded-full! border-0! text-[10px]! font-semibold'>
                  {t('detail.unsavedChanges')}
                </Tag>
              )}
            </div>
            {canEditPermissions && (
              <AppButton
                type='primary'
                icon={<Save size={14} aria-hidden='true' />}
                loading={assigning || removing}
                disabled={!isModified}
                onClick={handleSave}
              >
                {t('detail.saveChanges')}
              </AppButton>
            )}
          </div>
        }
      >
        <PermissionCheckboxGroup
          permissions={permissionsGrouped}
          value={currentSelected}
          disabled={!canEditPermissions}
          onChange={setSelected}
        />
      </AppCard>

      <CaslAbilityTesterWidget permissionKeys={activePermissionKeys} />
    </div>
  );
}
