import { beforeEach, describe, expect, it } from 'vitest';
import { DraftStorage } from './useAutosaveDraft';

describe('DraftStorage', () => {
  const mockStorage: Record<string, string> = {};
  const fakeLocalStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, val: string) => {
      mockStorage[key] = val;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
  } as unknown as Storage;

  beforeEach(() => {
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }
  });

  it('builds prefixed storage keys accurately', () => {
    expect(DraftStorage.buildKey('user_form')).toBe('cms_draft_user_form');
  });

  it('saves, checks, restores and clears draft data cleanly', () => {
    expect(DraftStorage.has('profile', fakeLocalStorage)).toBe(false);

    const saved = DraftStorage.save('profile', { username: 'john_doe', role: 'admin' }, fakeLocalStorage);
    expect(saved).toBe(true);
    expect(DraftStorage.has('profile', fakeLocalStorage)).toBe(true);

    const restored = DraftStorage.restore<{ username: string; role: string }>('profile', fakeLocalStorage);
    expect(restored).toEqual({ username: 'john_doe', role: 'admin' });

    DraftStorage.clear('profile', fakeLocalStorage);
    expect(DraftStorage.has('profile', fakeLocalStorage)).toBe(false);
    expect(DraftStorage.restore('profile', fakeLocalStorage)).toBeNull();
  });

  it('handles null storage safely without throwing exceptions', () => {
    expect(DraftStorage.save('test', { a: 1 }, null)).toBe(false);
    expect(DraftStorage.restore('test', null)).toBeNull();
    expect(DraftStorage.has('test', null)).toBe(false);
    expect(() => DraftStorage.clear('test', null)).not.toThrow();
  });
});
