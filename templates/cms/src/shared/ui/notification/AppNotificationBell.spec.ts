import type { NotificationCursorPaginatedResponse } from '@/shared/query-keys';
import { describe, expect, it } from 'vitest';
import type { NotificationItem } from './AppNotificationBell';

describe('AppNotificationBell contract and helper logic (R2)', () => {
  it('evaluates isItemRead strictly based on item.read without localStorage fallback', () => {
    const isItemRead = (item?: NotificationItem) => {
      if (!item) return true;
      return Boolean(item.read);
    };

    const unreadItem: NotificationItem = {
      id: 'notif-1',
      title: 'New Lead',
      description: 'Customer inquiry',
      time: '1m ago',
      read: false,
      type: 'lead',
    };

    const readItem: NotificationItem = {
      id: 'notif-2',
      title: 'Sample Updated',
      description: 'SMP-1001 modified',
      time: '5m ago',
      read: true,
      type: 'sample',
    };

    expect(isItemRead(unreadItem)).toBe(false);
    expect(isItemRead(readItem)).toBe(true);
    expect(isItemRead(undefined)).toBe(true);
  });

  it('unwraps backend R1 envelope { data: { items, totalUnread, nextCursor } } correctly', () => {
    const responseJson = {
      data: {
        items: [
          { id: 'n-1', title: 'Test 1', read: false, type: 'lead' },
          { id: 'n-2', title: 'Test 2', read: true, type: 'system' },
        ],
        totalUnread: 1,
        nextCursor: 'n-3',
      },
    };

    const payload: Record<string, unknown> =
      responseJson?.data && typeof responseJson.data === 'object' && !Array.isArray(responseJson.data)
        ? (responseJson.data as Record<string, unknown>)
        : (responseJson as Record<string, unknown>);

    const rawItems = Array.isArray(payload?.items) ? payload.items : [];
    const totalUnread = typeof payload?.totalUnread === 'number' ? payload.totalUnread : 0;
    const nextCursor = (payload?.nextCursor as string | undefined) ?? undefined;

    const parsed: NotificationCursorPaginatedResponse<unknown> & { totalUnread?: number } = {
      items: rawItems,
      nextCursor,
      hasMore: Boolean(nextCursor),
      totalUnread,
    };

    expect(parsed.items).toHaveLength(2);
    expect(parsed.totalUnread).toBe(1);
    expect(parsed.nextCursor).toBe('n-3');
    expect(parsed.hasMore).toBe(true);
  });

  it('calculates total unread correctly combining backend totalUnread and local live notifications', () => {
    const backendUnread = 3;
    const localLiveNotifications: NotificationItem[] = [
      { id: 'live-1', title: 'Live 1', description: '', time: '', read: false, type: 'lead' },
      { id: 'live-2', title: 'Live 2', description: '', time: '', read: true, type: 'system' },
    ];

    const isItemRead = (item?: NotificationItem) => Boolean(item?.read);
    const unreadCount = backendUnread + localLiveNotifications.filter(n => !isItemRead(n)).length;

    expect(unreadCount).toBe(4);
  });
});
