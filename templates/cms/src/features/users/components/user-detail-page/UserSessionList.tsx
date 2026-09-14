'use client';

import { useI18n } from '@/shared/i18n';
import { AppButton } from '@/shared/ui/button/AppButton';
import { AppTable } from '@/shared/ui/table/AppTable';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert, Modal } from 'antd';
import { useCallback, useMemo } from 'react';
import type { SessionInfo } from '../../models';
import { getUserSessionListColumns } from './utils/user-session-list.column';

interface UserSessionListProps {
  userId: string;
  sessions: SessionInfo[];
  onRevoke: (jti: string) => void;
  loading: boolean;
}

type SessionRow = SessionInfo & { id: string };

export function UserSessionList({ sessions, onRevoke, loading }: UserSessionListProps) {
  const t = useI18n('features.userManagement');
  const tCommon = useI18n('common');
  const sessionRows = useMemo(() => sessions.map(session => ({ ...session, id: session.jti })), [sessions]);

  const handleRevoke = useCallback((jti: string) => {
    Modal.confirm({
      title: t('sessions.revokeTitle'),
      content: t('sessions.revokeConfirmation'),
      okText: tCommon('revoke'),
      okButtonProps: { danger: true },
      cancelText: tCommon('cancel'),
      centered: true,
      onOk: () => onRevoke(jti),
    });
  }, [onRevoke, t, tCommon]);

  const baseColumns = useMemo(() => getUserSessionListColumns<SessionRow>(), []);
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
    <div className='flex flex-col gap-3'>
      <Alert
        type='info'
        icon={<InfoCircleOutlined />}
        showIcon
        message={t('sessions.featureInProgress')}
        description={t('sessions.featureInProgressDescription')}
      />
      {sessionRows.length > 0 && (
        <AppTable
          rowKey='jti'
          dataSource={sessionRows}
          loading={loading}
          columns={columns}
          pagination={false}
        />
      )}
    </div>
  );
}
