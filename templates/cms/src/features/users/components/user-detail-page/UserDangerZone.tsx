'use client';

import { useI18n } from '@/shared/i18n';
import { Alert, Button, Input, Modal, Tag, Tooltip, Typography } from 'antd';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { PublicProfile } from '../../models';

interface UserDangerZoneProps {
  user: PublicProfile;
  isSelf: boolean;
  onDelete: (reason: string) => void;
  onRestore: () => void;
  loading: boolean;
}

const MAX_REASON_LENGTH = 500;

export function UserDangerZone({ user, isSelf, onDelete, onRestore, loading }: UserDangerZoneProps) {
  const t = useI18n('features.userManagement');
  const [deleteReason, setDeleteReason] = useState('');
  const isDeleted = user.deletedAt !== null;

  const handleDeleteClick = () => {
    setDeleteReason('');
    Modal.confirm({
      title: t('dangerZone.deleteTitle'),
      centered: true,
      content: (
        <div className='flex flex-col gap-3 pt-2'>
          <Typography.Text type='secondary'>{t('dangerZone.deleteDescription')}</Typography.Text>
          <Input.TextArea
            rows={3}
            maxLength={MAX_REASON_LENGTH}
            showCount
            placeholder={t('dangerZone.deleteReasonPlaceholder')}
            onChange={e => setDeleteReason(e.target.value)}
          />
        </div>
      ),
      okText: t('dangerZone.confirmDeletion'),
      okButtonProps: { danger: true },
      cancelText: t('dangerZone.cancel'),
      onOk: () => {
        if (!deleteReason.trim()) {
          return Promise.reject(new Error(t('dangerZone.deleteReasonRequired')));
        }
        onDelete(deleteReason.trim());
      },
    });
  };

  const handleRestoreClick = () => {
    Modal.confirm({
      title: t('dangerZone.restoreTitle'),
      centered: true,
      content: t('dangerZone.restoreConfirmation', { email: user.email }),
      okText: t('dangerZone.restore'),
      cancelText: t('dangerZone.cancel'),
      onOk: onRestore,
    });
  };

  return (
    <div className='border-error/25 overflow-hidden rounded-lg border'>
      <div className='border-error/15 bg-error-bg flex items-center gap-3 border-b px-5 py-3'>
        <div className='bg-error/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg'>
          <AlertTriangle size={14} className='text-error' />
        </div>
        <div>
          <Typography.Text strong className='text-error block text-sm leading-tight'>
            {t('dangerZone.title')}
          </Typography.Text>
          <Typography.Text className='text-error/80 text-xs'>
            Irreversible actions — proceed with caution
          </Typography.Text>
        </div>
      </div>

      <div className='p-5'>
        {isDeleted ? (
          <div className='flex flex-col gap-4'>
            <Alert
              type='warning'
              showIcon
              message={
                <span className='text-sm font-semibold'>
                  {t('dangerZone.accountDeleted')}{' '}
                  <Tag color='red' className='ml-1 rounded-full! border-0! px-2! py-0! text-xs! font-semibold'>
                    {t('dangerZone.deletedTag')}
                  </Tag>
                </span>
              }
              description={
                <span className='text-xs'>
                  {t('dangerZone.reasonPrefix', {
                    reason: user.deletedReason ?? t('dangerZone.noReasonProvided'),
                  })}
                </span>
              }
            />

            <div className='bg-muted/40 border-border/50 flex items-center justify-between rounded-lg border px-4 py-3'>
              <div>
                <Typography.Text strong className='block text-sm'>
                  {t('dangerZone.restoreTitle')}
                </Typography.Text>
                <Typography.Text type='secondary' className='text-xs'>
                  Restore this account and allow the user to sign in again.
                </Typography.Text>
              </div>
              <Tooltip title={isSelf ? t('dangerZone.cannotRestoreSelf') : undefined}>
                <Button
                  icon={<RefreshCw size={16} />}
                  onClick={handleRestoreClick}
                  loading={loading}
                  disabled={isSelf || loading}
                  className='ml-3 shrink-0'
                >
                  {t('dangerZone.restoreTitle')}
                </Button>
              </Tooltip>
            </div>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            <div className='border-error/15 bg-error-bg flex items-center justify-between rounded-lg border px-4 py-3'>
              <div>
                <Typography.Text strong className='block text-sm'>
                  {t('dangerZone.deleteAccountTitle')}
                </Typography.Text>
                <Typography.Text type='secondary' className='text-xs'>
                  {t('dangerZone.deleteAccountDescription')}
                </Typography.Text>
              </div>
              <Tooltip title={isSelf ? t('dangerZone.cannotDeleteSelf') : undefined}>
                <Button
                  danger
                  icon={<Trash2 size={16} />}
                  onClick={handleDeleteClick}
                  loading={loading}
                  disabled={isSelf || loading}
                  className='ml-3 shrink-0'
                >
                  {t('dangerZone.deleteAccountTitle')}
                </Button>
              </Tooltip>
            </div>

            <p className='text-muted-foreground text-xs'>
              Deleting this account will prevent the user from signing in. The data will be soft-deleted and can be
              restored later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
