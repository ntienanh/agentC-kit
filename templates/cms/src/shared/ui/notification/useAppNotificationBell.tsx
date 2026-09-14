const useMutationHook = useMutation;
const apiFetch = fetch;
'use client';

import { useAntdNotification } from '@/shared/hooks';
import { initOperatorSocket, type OperatorNotificationPayload } from '@/shared/lib/socket/operatorSocket';
import {
  optimisticallyMarkAllNotificationsAsRead,
  optimisticallyMarkNotificationAsRead,
  unwrapNotificationEnvelope,
} from '@/shared/models/notification-contract';
import { APP_ROLE_NAMES } from '@/shared/models';
import { DASHBOARD_QUERY_KEYS, NOTIFICATION_QUERY_KEYS, SUPPORT_QUERY_KEYS } from '@/shared/query-keys';
import { useTenantStore, useUserStore } from '@/shared/stores';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { NotificationItem } from './notification-bell.types';
import { normalizeNotificationActionUrl } from './notification-bell.utils';
import { belongsToActiveStore, getSampleNotificationInvalidationKey } from './operator-notification.logic';

type NotificationInfiniteCache = {
  pages: Array<{ items: NotificationItem[]; totalUnread?: number }>;
};

export function useAppNotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notification = useAntdNotification();
  const activeStoreId = useTenantStore(state => state.activeStoreId);
  const user = useUserStore(state => state.user);
  const userRoleName = user?.role ? String(user.role) : undefined;
  const isSuperAdmin = userRoleName?.toUpperCase() === APP_ROLE_NAMES.SUPER_ADMIN;
  const isNotificationQueryEnabled = Boolean(user) && (isSuperAdmin || Boolean(activeStoreId));
  const [isRinging, setIsRinging] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const processedNotificationIds = useRef<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.infinite(activeStoreId ?? undefined),
    queryFn: async ({ pageParam }) => {
      const storeQuery = activeStoreId ? `&storeId=${encodeURIComponent(activeStoreId)}` : '';
      const url = pageParam
        ? `/api/proxy/notification?cursor=${encodeURIComponent(pageParam)}&limit=5${storeQuery}`
        : `/api/proxy/notification?limit=5${storeQuery}`;
      const response = await apiFetch(url, {
        headers: activeStoreId ? { 'X-Store-ID': activeStoreId } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return unwrapNotificationEnvelope<NotificationItem>(await response.json());
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => (lastPage?.hasMore ? lastPage.nextCursor : undefined),
    staleTime: 60000,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    enabled: isNotificationQueryEnabled,
  });

  const notifications = (data?.pages.flatMap(page => page?.items ?? []) ?? []).filter(Boolean);
  const unreadCount = data?.pages[0]?.totalUnread ?? 0;
  const previousUnreadCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > previousUnreadCount.current) {
      setIsRinging(true);
      const timer = setTimeout(() => setIsRinging(false), 4500);
      previousUnreadCount.current = unreadCount;
      return () => clearTimeout(timer);
    }
    previousUnreadCount.current = unreadCount;
  }, [unreadCount]);

  const handleIncomingNotification = useCallback(
    (payload: OperatorNotificationPayload) => {
      if (!belongsToActiveStore(payload, activeStoreId, isSuperAdmin)) return;
      if (payload.id && processedNotificationIds.current.has(payload.id)) return;
      if (payload.id) {
        processedNotificationIds.current.add(payload.id);
        setTimeout(() => processedNotificationIds.current.delete(payload.id), 5000);
      }

      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all, refetchType: 'all' });
      const sampleKey = getSampleNotificationInvalidationKey(payload);
      if (sampleKey) {
        void queryClient.invalidateQueries({ queryKey: sampleKey, refetchType: 'all' });
        void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.overview(), refetchType: 'all' });
      }

      if (payload.type === 'support' || payload.category === 'support') {
        void queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.all });
      }

      const targetUrl = normalizeNotificationActionUrl(payload.actionUrl);
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 4500);

      notification.info({
        title: payload.title || 'New Operator Notification',
        description: payload.message,
        placement: 'topRight',
        duration: 8,
        actions: targetUrl ? (
          <Button
            type='primary'
            size='small'
            className='bg-primary rounded-lg text-xs font-medium'
            onClick={() => {
              notification.destroy();
              router.push(targetUrl);
            }}
          >
            Xem chi tiết
          </Button>
        ) : undefined,
      });
    },
    [activeStoreId, isSuperAdmin, notification, queryClient, router],
  );

  useEffect(() => {
    if (!activeStoreId || !user) {
      setIsConnected(false);
      return;
    }

    return initOperatorSocket({
      storeId: activeStoreId,
      onNotification: handleIncomingNotification,
      onStatusChange: setIsConnected,
    });
  }, [activeStoreId, handleIncomingNotification, user]);

  const markAsRead = useMutationHook({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`/api/proxy/notification/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      queryClient.setQueriesData<NotificationInfiniteCache>({ queryKey: NOTIFICATION_QUERY_KEYS.all }, oldData =>
        optimisticallyMarkNotificationAsRead<NotificationItem>(oldData, id));
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all }),
  });

  const markAllAsRead = useMutationHook({
    mutationFn: async () => {
      const response = await apiFetch('/api/proxy/notification/mark-all-read', { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return response.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      queryClient.setQueriesData<NotificationInfiniteCache>({ queryKey: NOTIFICATION_QUERY_KEYS.all }, oldData =>
        optimisticallyMarkAllNotificationsAsRead<NotificationItem>(oldData));
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all }),
  });

  const handleOpenChange = (open: boolean) => {
    setPopoverOpen(open);
    if (open) setTimeout(() => listRef.current?.scrollTo({ top: 0 }), 0);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 60 && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  };

  const handleItemClick = (item: NotificationItem) => {
    markAsRead.mutate(item.id);
    setPopoverOpen(false);
    if (item.actionUrl) router.push(item.actionUrl);
    else setSelectedNotification(item);
  };

  const handleSelectedNotificationAction = () => {
    const targetUrl = selectedNotification?.actionUrl;
    setSelectedNotification(null);
    if (targetUrl) router.push(targetUrl);
  };

  return {
    handleItemClick,
    handleOpenChange,
    handleScroll,
    handleSelectedNotificationAction,
    isConnected,
    isFetchingNextPage,
    isRinging,
    listRef,
    markAllAsRead: () => markAllAsRead.mutate(),
    notifications,
    popoverOpen,
    selectedNotification,
    setSelectedNotification,
    unreadCount,
  };
}
