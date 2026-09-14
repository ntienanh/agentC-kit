import type { OperatorNotificationPayload } from '@/shared/lib/socket/operatorSocket';

export function isSampleOperatorNotification(
  payload: Pick<OperatorNotificationPayload, 'category' | 'type'>,
) {
  return payload.category === 'sample' || payload.type === 'sample';
}

export function getSampleNotificationInvalidationKey(
  payload: Pick<OperatorNotificationPayload, 'category' | 'type'>,
): readonly string[] | null {
  return isSampleOperatorNotification(payload) ? (['samples'] as const) : null;
}

export function belongsToActiveStore(
  payload: Pick<OperatorNotificationPayload, 'storeId'>,
  activeStoreId: string | null,
  isSuperAdmin?: boolean,
) {
  return isSuperAdmin || !payload.storeId || !activeStoreId || payload.storeId === activeStoreId;
}
