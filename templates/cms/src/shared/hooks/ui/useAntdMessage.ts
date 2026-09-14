'use client';

import { App } from 'antd';

export function useAntdMessage() {
  const { message } = App.useApp();
  return message;
}
