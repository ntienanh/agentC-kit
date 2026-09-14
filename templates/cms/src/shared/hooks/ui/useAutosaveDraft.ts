'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const DRAFT_STORAGE_PREFIX = 'cms_draft_';

export class DraftStorage {
  public static buildKey(key: string): string {
    return `${DRAFT_STORAGE_PREFIX}${key}`;
  }

  public static save<T>(key: string, data: T, storage: Storage | null = globalThis.localStorage): boolean {
    if (!storage) return false;
    try {
      storage.setItem(this.buildKey(key), JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  public static restore<T>(key: string, storage: Storage | null = globalThis.localStorage): T | null {
    if (!storage) return null;
    try {
      const raw = storage.getItem(this.buildKey(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public static clear(key: string, storage: Storage | null = globalThis.localStorage): void {
    if (!storage) return;
    try {
      storage.removeItem(this.buildKey(key));
    } catch {
      void 0;
    }
  }

  public static has(key: string, storage: Storage | null = globalThis.localStorage): boolean {
    if (!storage) return false;
    try {
      return storage.getItem(this.buildKey(key)) !== null;
    } catch {
      return false;
    }
  }
}

export interface UseAutosaveDraftOptions<T> {
  key: string;
  debounceMs?: number;
  onRestore?: (savedData: T) => void;
}

export function useAutosaveDraft<T extends Record<string, unknown>>({
  key,
  debounceMs = 500,
  onRestore,
}: UseAutosaveDraftOptions<T>) {
  const [hasDraft, setHasDraft] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHasDraft(DraftStorage.has(key));
  }, [key]);

  const saveDraft = useCallback(
    (data: T) => {
      if (typeof window === 'undefined') return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const saved = DraftStorage.save(key, data);
        if (saved) setHasDraft(true);
      }, debounceMs);
    },
    [key, debounceMs],
  );

  const restoreDraft = useCallback((): T | null => {
    if (typeof window === 'undefined') return null;
    const restored = DraftStorage.restore<T>(key);
    if (restored && onRestore) {
      onRestore(restored);
    }
    return restored;
  }, [key, onRestore]);

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    DraftStorage.clear(key);
    setHasDraft(false);
  }, [key]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    hasDraft,
    saveDraft,
    restoreDraft,
    clearDraft,
  };
}
