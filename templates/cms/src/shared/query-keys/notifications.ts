export type NotificationCursorPaginatedResponse<T> = {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
  totalUnread?: number;
};

export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  infinite: (storeId?: string) => ['notifications', 'cursor-infinite', storeId ?? 'all'] as const,
};
