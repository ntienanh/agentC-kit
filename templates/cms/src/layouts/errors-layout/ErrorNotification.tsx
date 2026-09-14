'use client';

import { useAntdNotification } from '@/shared/hooks/ui/useAntdNotification';
import { ErrorSeverity, type EnhancedError } from '@/shared/lib/error/types';
import { useError } from '@/shared/providers';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';

interface ErrorNotificationProps {
  autoNotify?: boolean;
  minSeverity?: ErrorSeverity;
}

const SEVERITY_PRIORITY: Record<ErrorSeverity, number> = {
  [ErrorSeverity.LOW]: 1,
  [ErrorSeverity.MEDIUM]: 2,
  [ErrorSeverity.HIGH]: 3,
  [ErrorSeverity.CRITICAL]: 4,
};

export function ErrorNotification({
  autoNotify = true,
  minSeverity = ErrorSeverity.MEDIUM,
}: ErrorNotificationProps) {
  const { errors, markErrorHandled } = useError();
  const t = useTranslations('error');
  const notification = useAntdNotification();

  const showNotification = useCallback(
    (error: EnhancedError) => {
      if (SEVERITY_PRIORITY[error.severity] < SEVERITY_PRIORITY[minSeverity]) return;
      if (!error.userVisible) return;

      const config = getNotificationConfig(error, t);

      switch (error.severity) {
        case ErrorSeverity.CRITICAL:
          notification.error({ ...config, duration: 0, placement: 'top' });
          break;
        case ErrorSeverity.HIGH:
          notification.error({ ...config, duration: 8, placement: 'topRight' });
          break;
        case ErrorSeverity.MEDIUM:
          notification.warning({ ...config, duration: 5, placement: 'topRight' });
          break;
        case ErrorSeverity.LOW:
          notification.info({ ...config, duration: 3, placement: 'bottomRight' });
          break;
      }

      markErrorHandled(error.id);
    },
    [markErrorHandled, minSeverity, t, notification],
  );

  useEffect(() => {
    if (!autoNotify) return;
    const unhandledErrors = errors.filter(e => !e.handled && e.userVisible);
    unhandledErrors.forEach(error => showNotification(error));
  }, [errors, autoNotify, showNotification]);

  return null;
}

function getNotificationConfig(error: EnhancedError, t: (key: string) => string, customMessage?: string) {
  return {
    title: getNotificationTitle(error, t),
    description: customMessage || error.message || t('defaultMessage'),
  };
}

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
