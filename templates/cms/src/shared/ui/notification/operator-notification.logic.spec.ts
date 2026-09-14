import { describe, expect, it } from 'vitest';
import {
  belongsToActiveStore,
  getSampleNotificationInvalidationKey,
  isSampleOperatorNotification,
} from './operator-notification.logic';

describe('operator notification sample invalidation', () => {
  it('uses the canonical samples key for sample events', () => {
    const payload = { category: 'sample', type: 'sample' };

    expect(isSampleOperatorNotification(payload)).toBe(true);
    expect(getSampleNotificationInvalidationKey(payload)).toEqual(['samples']);
  });

  it('does not invalidate sample data for lead and support events', () => {
    expect(getSampleNotificationInvalidationKey({ category: 'lead_capture' })).toBeNull();
    expect(getSampleNotificationInvalidationKey({ type: 'support' })).toBeNull();
  });

  it('filters scoped events to the active store', () => {
    expect(belongsToActiveStore({ storeId: 'store-1' }, 'store-1')).toBe(true);
    expect(belongsToActiveStore({ storeId: 'store-2' }, 'store-1')).toBe(false);
    expect(belongsToActiveStore({}, 'store-1')).toBe(true);
  });
});
