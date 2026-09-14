'use client';

import { Button } from 'antd';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, Home, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ErrorFallbackProps } from './ErrorBoundary';

export function AppGlobalErrorFallback({ error, resetErrorBoundary }: Readonly<ErrorFallbackProps>) {
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleGoDashboard = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  const handleResetSession = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('ui-density-preference');
      resetErrorBoundary();
      window.location.href = '/dashboard';
    }
  };

  const errorMessage = error?.message || 'An unexpected client-side rendering error occurred.';

  const content = (
    <div className='bg-background/80 fixed inset-0 z-[99999] flex min-h-screen min-w-full items-center justify-center overflow-y-auto p-4 backdrop-blur-md sm:p-6'>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className='surface-glass border-destructive/20 bg-card/60 relative my-auto w-full max-w-lg shrink-0 overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-xl sm:p-8'
      >
        <div className='flex flex-col items-center text-center'>
          <div className='border-destructive/30 bg-destructive/10 text-destructive shadow-destructive/20 relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-xs'>
            <span className='bg-destructive/20 absolute inset-0 animate-pulse rounded-2xl blur-md' />
            <AlertTriangle className='relative h-8 w-8' />
          </div>

          <h2 className='text-heading text-xl font-bold tracking-tight sm:text-2xl'>Unexpected Application Error</h2>
          <p className='text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm'>
            An unexpected error was encountered while rendering this page. You can try refreshing the view or returning
            to the dashboard.
          </p>

          <div className='mt-6 flex w-full flex-wrap items-center justify-center gap-3'>
            <Button
              type='primary'
              size='large'
              icon={<RefreshCw className='h-4 w-4' />}
              onClick={handleReload}
              className='bg-primary hover:bg-primary-hover! h-10 border-none text-xs font-semibold shadow-xs transition-transform active:scale-[0.98]'
            >
              Reload Page
            </Button>

            <Button
              size='large'
              icon={<Home className='h-4 w-4' />}
              onClick={handleGoDashboard}
              className='border-border h-10 text-xs font-semibold'
            >
              Dashboard
            </Button>

            <Button
              type='text'
              size='large'
              danger
              icon={<Trash2 className='h-4 w-4' />}
              onClick={handleResetSession}
              className='h-10 text-xs font-semibold'
            >
              Reset Session
            </Button>
          </div>

          <div className='border-border/40 mt-6 w-full border-t pt-4 text-left'>
            <button
              type='button'
              onClick={() => setShowDetails(!showDetails)}
              className='text-muted-foreground hover:text-foreground flex w-full items-center justify-between text-xs font-medium transition-colors'
            >
              <span>Technical Diagnostics</span>
              {showDetails ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className='border-border/60 bg-muted/50 text-muted-foreground mt-3 overflow-hidden rounded-lg border p-3 font-mono text-[11px]'
              >
                <p className='text-destructive truncate font-semibold'>{errorMessage}</p>
                {error?.context?.componentStack && (
                  <pre className='text-muted-foreground/80 mt-2 max-h-36 overflow-auto text-[10px] leading-snug whitespace-pre-wrap'>
                    {error.context.componentStack}
                  </pre>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (mounted && typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
}
