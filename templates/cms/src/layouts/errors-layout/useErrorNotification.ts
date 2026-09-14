'use client';

import { useAntdNotification } from '@/shared/hooks/ui/useAntdNotification';
import { ErrorSeverity, type EnhancedError } from '@/shared/lib/error/types';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

function getNotificationTitle(error: EnhancedError, t: (key: string) => string): string {
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      return t('criticalTitle');
    case ErrorSeverity.HIGH:
      return t('errorTitle');
    case ErrorSeverity.MEDIUM:
      return t('warningTitle');
    case ErrorSeverity.LOW:
      return t('infoTitle');
    default:
      return t('errorTitle');
  }
}

function getNotificationConfig(error: EnhancedError, t: (key: string) => string, customMessage?: string) {
  return {
    title: getNotificationTitle(error, t),
    description: customMessage || error.message || t('defaultMessage'),
  };
}

export function useErrorNotification() {
  const t = useTranslations('error');
  const notification = useAntdNotification();

  const notify = useCallback(
    (error: EnhancedError, customMessage?: string) => {
      const config = getNotificationConfig(error, t, customMessage);

      switch (error.severity) {
        case ErrorSeverity.CRITICAL:
          return notification.error({ ...config, duration: 0, placement: 'top' });
        case ErrorSeverity.HIGH:
          return notification.error({ ...config, duration: 8, placement: 'topRight' });
        case ErrorSeverity.MEDIUM:
          return notification.warning({ ...config, duration: 5, placement: 'topRight' });
        case ErrorSeverity.LOW:
        default:
          return notification.info({ ...config, duration: 3, placement: 'bottomRight' });
      }
    },
    [t, notification],
  );

  const notifySuccess = useCallback(
    (title: string, description?: string) => {
      notification.success({ title, description, duration: 3, placement: 'topRight' });
    },
    [notification],
  );

  const notifyWarning = useCallback(
    (title: string, description?: string) => {
      notification.warning({ title, description, duration: 5, placement: 'topRight' });
    },
    [notification],
  );

  const notifyError = useCallback(
    (title: string, description?: string) => {
      notification.error({ title, description, duration: 5, placement: 'topRight' });
    },
    [notification],
  );

  return { notify, notifySuccess, notifyWarning, notifyError };
}
