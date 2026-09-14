import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

export interface UseRealtimeUpdatesSyncOptions {
  channelName?: string;
  queryKeysToInvalidate?: string[][];
  onSyncEvent?: (eventData: Record<string, unknown>) => void;
}

export function useRealtimeUpdatesSync(options: UseRealtimeUpdatesSyncOptions = {}) {
  const {
    channelName: _channelName = 'cms_core_sync',
    queryKeysToInvalidate = [['samples'], ['dashboard']],
    onSyncEvent,
  } = options;

  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<Record<string, unknown>>;
      const data = customEvent.detail;
      const category = (data?.category as string) || (data?.type as string);
      if (category === 'sample' || category === 'core' || data?.id) {
        setUnreadCount((prev) => prev + 1);
        if (onSyncEvent) {
          onSyncEvent(data);
        }
      }
    };

    window.addEventListener('operator_notification', handleNotification);

    return () => {
      window.removeEventListener('operator_notification', handleNotification);
    };
  }, [onSyncEvent]);

  const handleRefresh = useCallback(() => {
    queryKeysToInvalidate.forEach((queryKey) => {
      void queryClient.invalidateQueries({ queryKey });
    });
    setUnreadCount(0);
  }, [queryClient, queryKeysToInvalidate]);

  const handleDismiss = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    unreadCount,
    hasNewUpdates: unreadCount > 0,
    handleRefresh,
    handleDismiss,
  };
}
