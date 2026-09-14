'use client';

import { App } from 'antd';

export function useAntdNotification() {
  const { notification } = App.useApp();
  return notification;
}
