import type { OperatorNotificationPayload } from '@/shared/lib/socket/operatorSocket';
import dayjs from '@/shared/utils/dayjs.util';
import type { NotificationItem } from './notification-bell.types';
import { isSampleOperatorNotification } from './operator-notification.logic';

export function normalizeNotificationActionUrl(url?: string) {
  return url?.replace(/^\/en/, '');
}

export function resolveOperatorNotificationType(payload: OperatorNotificationPayload): NotificationItem['type'] {
  if (isSampleOperatorNotification(payload) || payload.type === 'sample' || payload.category === 'sample') return 'sample';
  if (payload.type === 'support' || payload.category === 'support') return 'support';
  if (payload.type === 'franchise' || payload.category === 'lead_capture') return 'lead';
  return 'system';
}

export function formatNotificationTime(createdAt?: string | Date, fallbackTime?: string): string {
  if (!createdAt) return fallbackTime || 'Just now';
  const target = dayjs(createdAt);
  if (!target.isValid()) return fallbackTime || 'Just now';

  const now = dayjs();
  const diffSec = now.diff(target, 'second');
  if (diffSec < 60) return 'Just now';

  const diffMin = now.diff(target, 'minute');
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = now.diff(target, 'hour');
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDays = now.diff(target, 'day');
  if (diffDays < 7) return `${diffDays}d ago`;

  return target.format('DD/MM/YYYY HH:mm');
}
