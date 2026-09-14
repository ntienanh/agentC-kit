'use client';

import { ErrorSeverity } from '@/shared/lib/error/types';
import { ErrorContextProvider } from '@/shared/providers';
import { type ReactNode } from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { ErrorNotification } from './ErrorNotification';

interface ErrorHandlingProviderProps {
  children: ReactNode;
  autoNotify?: boolean;
  minNotificationSeverity?: ErrorSeverity;
  errorFallback?: ReactNode;
  onError?: (error: unknown, errorInfo: unknown) => void;
  onReset?: () => void;
}

export function ErrorHandlingProvider({
  children,
  autoNotify = true,
  minNotificationSeverity = ErrorSeverity.MEDIUM,
  errorFallback,
  onError,
  onReset,
}: Readonly<ErrorHandlingProviderProps>) {
  return (
    <ErrorContextProvider>
      <ErrorBoundary fallback={errorFallback} onError={onError} onReset={onReset}>
        <ErrorNotification autoNotify={autoNotify} minSeverity={minNotificationSeverity} />
        {children}
      </ErrorBoundary>
    </ErrorContextProvider>
  );
}
