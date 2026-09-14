'use client';

import { useAntdMessage } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { showErrorMessage } from '@/shared/lib/error';
import { AppButton } from '@/shared/ui/button/AppButton';
import { AppCard } from '@/shared/ui/card/AppCard';
import { AppPageHeader } from '@/shared/ui/page/AppPageHeader';
import { AppTable } from '@/shared/ui/table/AppTable';
import { useSessionsLogic } from '@/logic/users/useSessionsLogic';
import { Modal } from 'antd';
import { useCallback, useMemo } from 'react';
import { useSelfSessionMutation } from '@/logic/users/useSelfSessionMutation';
import type { SessionInfo } from '../../models';
import { getSessionListColumns } from './utils/session-list.column';

type SessionRow = SessionInfo & { id: string };

export function SessionsPage() {
  const message = useAntdMessage();
  const t = useI18n('features.userManagement');
  const tCommon = useI18n('common');
  const tError = useI18n('error');
  const { revokeSession } = useSelfSessionMutation();

  const handleRevoke = useCallback((jti: string) => {
    Modal.confirm({
      title: t('sessions.revokeTitle'),
      content: t('sessions.revokeConfirmation'),
      okText: tCommon('revoke'),
      okButtonProps: { danger: true },
      cancelText: tCommon('cancel'),
      centered: true,
      onOk: async () => {
        try {
          await revokeSession.mutateAsync({ jti });
          message.success(t('sessions.revokeSuccess'));
        } catch (err) {
          showErrorMessage(message, err, tError, 'SESSION_REVOKE_FAILED');
        }
      },
    });
  }, [message, revokeSession, t, tCommon, tError]);

  const { data: rawData, isLoading } = useSessionsLogic();

  const data = useMemo(() => rawData ?? [], [rawData]);
  const baseColumns = useMemo(() => getSessionListColumns<SessionRow>(t), [t]);

  const columns = useMemo(
    () => [
      ...baseColumns,
      {
        title: tCommon('actions'),
        key: 'actions',
        width: 100,
        render: (_value: unknown, record: SessionRow) => (
          <AppButton
            danger
            size='small'
            onClick={() => handleRevoke(record.jti)}
          >
            {tCommon('revoke')}
          </AppButton>
        ),
      },
    ],
    [baseColumns, handleRevoke, tCommon],
  );

  return (
    <div className='content-spacing space-y-6'>
      <AppPageHeader
        title={t('sessions.title')}
        description='Review active authenticated device sessions and security tokens attached to your account.'
      />

      <AppCard padding='sm' className='bg-card/90 border-border/50 rounded-xl shadow-xs backdrop-blur-md'>
        <AppTable
          rowKey='jti'
          dataSource={data}
          loading={isLoading}
          columns={columns}
          pagination={false}
        />
      </AppCard>
    </div>
  );
}
