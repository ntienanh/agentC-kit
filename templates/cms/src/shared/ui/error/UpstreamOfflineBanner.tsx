'use client';

import { Button } from 'antd';
import { motion } from 'framer-motion';
import { RefreshCw, ServerOff, WifiOff } from 'lucide-react';

interface UpstreamOfflineBannerProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  loading?: boolean;
}

export function UpstreamOfflineBanner({
  title = 'CMS Backend Service Offline (PROXY_UPSTREAM_UNAVAILABLE)',
  description = 'Backend NestJS service (port 4000) is currently unavailable or unreachable. You can retry the connection or continue interacting with local dev features.',
  onRetry,
  loading = false,
}: Readonly<UpstreamOfflineBannerProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='surface-glass relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-xs backdrop-blur-md'
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-start gap-3.5'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500'>
            <ServerOff className='h-5 w-5' />
          </div>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-semibold text-amber-600 dark:text-amber-400'>{title}</h3>
              <span className='inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.625rem] font-medium text-amber-600 dark:text-amber-300'>
                <WifiOff className='h-3 w-3' /> Offline
              </span>
            </div>
            <p className='text-muted-foreground text-xs leading-relaxed'>{description}</p>
          </div>
        </div>

        {onRetry && (
          <div className='flex shrink-0 items-center gap-2.5 pt-2 sm:pt-0'>
            <Button
              type='primary'
              size='middle'
              icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
              loading={loading}
              onClick={onRetry}
              className='border-none bg-amber-600 text-xs font-medium shadow-xs transition-transform duration-200 hover:bg-amber-700! active:scale-[0.98]'
            >
              Retry Connection
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
