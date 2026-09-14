export type CmsNotificationContractSource = {
  id?: string | null;
  type?: string | null;
  status?: string | null;
  channel?: string | null;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  customerId?: string | number | null;
  read?: boolean | null;
  createdAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
};

export type MvpCmsNotificationContract = {
  notificationId?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  type: string;
  status: string;
  channel: string;
  readState: 'read' | 'unread';
  createdAt?: string;
  deliveredAt?: string;
  readAt?: string;
  foReceiptLookup: {
    route: '/notifications';
    notificationId?: string;
  };
  cmsContinuityRoutes: readonly ['/en/dashboard', '/en/users', '/en/roles'];
};

export type NotificationCursorParams = {
  cursor?: string;
  limit?: number;
  type?: string;
  readOnlyUnread?: boolean;
};

export type NotificationCursorPaginatedResponse<T = MvpCmsNotificationContract> = {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
  totalUnread?: number;
};

function normalizeText(value?: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function buildCmsNotificationContract(source: CmsNotificationContractSource): MvpCmsNotificationContract {
  const notificationId = normalizeText(source.id);
  const customerEmail = normalizeText(source.recipientEmail)?.toLowerCase();
  const customerPhone = normalizeText(source.recipientPhone);
  const customerId = source.customerId == null ? undefined : String(source.customerId);

  return {
    notificationId,
    customerId,
    customerEmail,
    customerPhone,
    type: normalizeText(source.type) ?? 'unknown',
    status: normalizeText(source.status) ?? 'unknown',
    channel: normalizeText(source.channel) ?? 'unknown',
    readState: source.read ? 'read' : 'unread',
    createdAt: normalizeText(source.createdAt),
    deliveredAt: normalizeText(source.deliveredAt),
    readAt: normalizeText(source.readAt),
    foReceiptLookup: {
      route: '/notifications',
      notificationId,
    },
    cmsContinuityRoutes: ['/en/dashboard', '/en/users', '/en/roles'],
  };
}

export function paginateNotificationsByCursor<T extends { id?: string }>(
  allNotifications: T[],
  params: NotificationCursorParams,
): NotificationCursorPaginatedResponse<T> {
  const limit = params.limit ?? 5;
  const cursorIndex = params.cursor ? allNotifications.findIndex(item => item.id === params.cursor) : -1;

  const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
  const sliced = allNotifications.slice(startIndex, startIndex + limit);
  const nextItem = allNotifications[startIndex + limit];
  const nextCursor = nextItem?.id;
  const hasMore = Boolean(nextCursor);

  return {
    items: sliced,
    nextCursor,
    hasMore,
  };
}

export function unwrapNotificationEnvelope<T = unknown>(
  json: unknown,
): NotificationCursorPaginatedResponse<T> & { totalUnread?: number } {
  const payload =
    json && typeof json === 'object' && 'data' in json && typeof (json as { data: unknown }).data === 'object' && !Array.isArray((json as { data: unknown }).data)
      ? (json as { data: Record<string, unknown> }).data
      : (json as Record<string, unknown> | undefined);
  const rawItems: T[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? (payload.items as T[])
      : Array.isArray(payload?.data)
        ? (payload.data as T[])
        : [];
  const nextCursor = (payload?.nextCursor ?? (payload?.meta as Record<string, unknown> | undefined)?.nextCursor ?? (payload?.pagination as Record<string, unknown> | undefined)?.nextCursor) as string | undefined;
  const totalUnread =
    typeof payload?.totalUnread === 'number'
      ? payload.totalUnread
      : typeof (payload?.meta as Record<string, unknown> | undefined)?.totalUnread === 'number'
        ? ((payload?.meta as Record<string, unknown>).totalUnread as number)
        : rawItems.filter((i: unknown) => !(i as { read?: boolean })?.read).length;
  return {
    items: rawItems,
    nextCursor: nextCursor ?? undefined,
    hasMore: Boolean(payload?.hasMore ?? (payload?.meta as Record<string, unknown> | undefined)?.hasMore ?? nextCursor),
    totalUnread,
  };
}

export function isNotificationItemRead(item?: { read?: boolean | null } | null): boolean {
  if (!item) return true;
  return Boolean(item.read);
}

export function calculateUnreadCount(
  backendUnread: number | undefined,
  localLiveNotifications: Array<{ id?: string; read?: boolean | null }>,
  allNotifications: Array<{ id?: string; read?: boolean | null }>,
): number {
  if (typeof backendUnread !== 'number') {
    return allNotifications.filter(n => !isNotificationItemRead(n)).length;
  }

  const fetchedNotificationIds = new Set(allNotifications.map(n => n?.id).filter(Boolean));

  const pendingLocalUnreadCount = localLiveNotifications.filter(
    n => !isNotificationItemRead(n) && (!n?.id || !fetchedNotificationIds.has(n.id)),
  ).length;

  return backendUnread + pendingLocalUnreadCount;
}

export function optimisticallyMarkNotificationAsRead<T extends { id: string; read: boolean }>(
  oldData: { pages: Array<{ items: T[]; totalUnread?: number }> } | undefined,
  id: string,
) {
  if (!oldData || !oldData.pages) return oldData;
  return {
    ...oldData,
    pages: oldData.pages.map(page => {
      if (!page?.items) return page;
      let itemWasUnread = false;
      const updatedItems = page.items.map(item => {
        if (item.id === id) {
          if (!item.read) itemWasUnread = true;
          return { ...item, read: true };
        }
        return item;
      });
      const newTotalUnread =
        typeof page.totalUnread === 'number'
          ? Math.max(0, page.totalUnread - (itemWasUnread ? 1 : 0))
          : page.totalUnread;
      return {
        ...page,
        items: updatedItems,
        totalUnread: newTotalUnread,
      };
    }),
  };
}

export function optimisticallyMarkAllNotificationsAsRead<T extends { read: boolean }>(
  oldData: { pages: Array<{ items: T[]; totalUnread?: number }> } | undefined,
) {
  if (!oldData || !oldData.pages) return oldData;
  return {
    ...oldData,
    pages: oldData.pages.map(page => {
      if (!page?.items) return page;
      return {
        ...page,
        items: page.items.map(item => ({ ...item, read: true })),
        totalUnread: 0,
      };
    }),
  };
}
