'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { initOperatorSocket } from '@/shared/lib/socket/operatorSocket';
import { NOTIFICATION_QUERY_KEYS } from '@/shared/query-keys';
import { useTenantStore, useUserStore } from '@/shared/stores';

interface RealtimeContextType {
  isConnected: boolean;
  lastConnectedAt: number | null;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  lastConnectedAt: null,
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastConnectedAt, setLastConnectedAt] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const activeStoreId = useTenantStore(s => s.activeStoreId);
  const user = useUserStore(s => s.user);
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    if (!activeStoreId || !user) {
      setIsConnected(false);
      return;
    }

    const cleanup = initOperatorSocket({
      storeId: activeStoreId,
      onNotification: () => {
        void queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all, refetchType: 'all' });
      },
      onStatusChange: (status) => {
        setIsConnected(status);
        if (status) {
          const now = Date.now();
          if (wasConnectedRef.current && lastConnectedAt) {
            void queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all, refetchType: 'all' });
          }
          wasConnectedRef.current = true;
          setLastConnectedAt(now);
        }
      },
    });

    return () => {
      cleanup();
    };
  }, [activeStoreId, lastConnectedAt, queryClient, user]);

  return (
    <RealtimeContext.Provider value={{ isConnected, lastConnectedAt }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeStatus() {
  return useContext(RealtimeContext);
}
