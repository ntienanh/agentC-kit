'use client';

import dayjs from '@/shared/utils/dayjs.util';
import { Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { SessionInfo } from '../../../models';

export function getSessionListColumns<T extends SessionInfo = SessionInfo>(t: (key: string) => string): ColumnsType<T> {
  return [
    {
      title: t('sessions.columns.jti'),
      dataIndex: 'jti',
      key: 'jti',
      render: (jti: string) => (
        <Typography.Text code className='text-xs'>
          {jti.slice(0, 8)}...
        </Typography.Text>
      ),
    },
    {
      title: t('sessions.columns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: t('sessions.columns.expiresAt'),
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];
}
