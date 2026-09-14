import { describe, expect, it } from 'vitest';
import { NOTIFICATION_QUERY_KEYS } from './notifications';

describe('query-keys', () => {
  it('generates NOTIFICATION_QUERY_KEYS correctly', () => {
    expect(NOTIFICATION_QUERY_KEYS.all).toEqual(['notifications']);
    expect(NOTIFICATION_QUERY_KEYS.infinite()).toEqual(['notifications', 'cursor-infinite', 'all']);
    expect(NOTIFICATION_QUERY_KEYS.infinite('store-1')).toEqual(['notifications', 'cursor-infinite', 'store-1']);
  });
});

