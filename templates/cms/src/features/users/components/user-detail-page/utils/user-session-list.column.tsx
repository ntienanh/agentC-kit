'use client';

import dayjs from '@/shared/utils/dayjs.util';
import { Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { SessionInfo } from '../../../models';

export function getUserSessionListColumns<T extends SessionInfo = SessionInfo>(): ColumnsType<T> {
  return [
    {
      title: 'JTI',
      dataIndex: 'jti',
      key: 'jti',
      render: (jti: string) => (
        <Typography.Text code className='text-xs'>
          {jti.slice(0, 8)}...
        </Typography.Text>
      ),
    },
    {
      title: 'Created at',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Expires at',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];
}
