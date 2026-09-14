'use client';

import { transformUnknownError } from '@/shared/lib/error/transformer';
import type { EnhancedError } from '@/shared/lib/error/types';
import { Button } from 'antd';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import React, { useCallback, useState, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: EnhancedError | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: ErrorFallbackProps) => ReactNode);
  onError?: (error: EnhancedError, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
}

export interface ErrorFallbackProps {
  error: EnhancedError;
  resetErrorBoundary: () => void;
}

function useErrorBoundaryState(props: ErrorBoundaryProps): {
  state: ErrorBoundaryState;
  handleError: (error: unknown, errorInfo: ErrorInfo) => void;
  resetErrorBoundary: () => void;
} {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
  });

  const handleError = useCallback(
    (error: unknown, errorInfo: ErrorInfo) => {
      const enhancedError = transformUnknownError(error, {
        component: 'ErrorBoundary',
        action: 'render',
      });

      enhancedError.context = {
        ...enhancedError.context,
        componentStack: errorInfo.componentStack ?? undefined,
      };

      setState({ hasError: true, error: enhancedError });

      props.onError?.(enhancedError, errorInfo);

      if (process.env.NODE_ENV === 'development') {
        console.error('ErrorBoundary caught an error:', enhancedError);
      }
    },
    [props],
  );

  const resetErrorBoundary = useCallback(() => {
    props.onReset?.();
    setState({ hasError: false, error: null });
  }, [props]);

  return { state, handleError, resetErrorBoundary };
}

export function ErrorBoundary({ children, fallback, onError, onReset, resetKeys }: Readonly<ErrorBoundaryProps>) {
  const { state, handleError, resetErrorBoundary } = useErrorBoundaryState({
    children,
    fallback,
    onError,
    onReset,
    resetKeys,
  });

  useResetKeys(resetKeys, resetErrorBoundary, state.hasError);

  if (state.hasError && state.error) {
    const fallbackProps: ErrorFallbackProps = {
      error: state.error,
      resetErrorBoundary,
    };

    if (typeof fallback === 'function') {
      return fallback(fallbackProps);
    }

    if (fallback) {
      return fallback;
    }

    return <LocalizedErrorFallback error={state.error} onRetry={resetErrorBoundary} />;
  }

  return <ErrorBoundaryClass onError={handleError}>{children}</ErrorBoundaryClass>;
}

export function LocalizedErrorFallback({
  error,
  onRetry,
  title,
  message,
}: {
  readonly error?: EnhancedError | null;
  readonly onRetry?: () => void;
  readonly title?: string;
  readonly message?: string;
}) {
  const displayTitle = title || 'Section rendering failed';
  const displayMessage = message || error?.message || 'An unexpected client-side error occurred in this view.';

  return (
    <div className='bg-card border-destructive/20 m-2 flex min-h-[160px] w-full flex-col items-center justify-center rounded-xl border p-6 text-center shadow-xs'>
      <div className='bg-destructive/10 text-destructive border-destructive/20 mb-3 flex h-10 w-10 items-center justify-center rounded-xl border'>
        <AlertTriangle className='h-5 w-5 animate-pulse' />
      </div>
      <h3 className='text-foreground mb-1 text-sm font-semibold'>{displayTitle}</h3>
      <p className='text-muted-foreground mb-4 max-w-md text-xs leading-relaxed'>{displayMessage}</p>
      {onRetry && (
        <Button type='primary' size='small' icon={<RefreshCw className='h-3.5 w-3.5' />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

interface ErrorBoundaryClassState {
  hasError: boolean;
  error: unknown;
}

class ErrorBoundaryClass extends React.Component<
  {
    children: ReactNode;
    onError: (error: unknown, errorInfo: ErrorInfo) => void;
  },
  ErrorBoundaryClassState
> {
  constructor(props: { children: ReactNode; onError: (error: unknown, errorInfo: ErrorInfo) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryClassState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

function useResetKeys(
  resetKeys: Array<string | number> | undefined,
  resetErrorBoundary: () => void,
  hasError: boolean,
) {
  const prevResetKeysRef = React.useRef<Array<string | number> | undefined>(resetKeys);

  React.useEffect(() => {
    if (!hasError || !resetKeys) return;

    const prevResetKeys = prevResetKeysRef.current;
    const hasResetKeyChanged =
      prevResetKeys === undefined || resetKeys.some((key, index) => key !== prevResetKeys[index]);

    if (hasResetKeyChanged) {
      resetErrorBoundary();
    }

    prevResetKeysRef.current = resetKeys;
  }, [resetKeys, hasError, resetErrorBoundary]);
}
