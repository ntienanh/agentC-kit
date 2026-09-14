'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useDebounceCallback<TArgs extends unknown[]>(callback: (...args: TArgs) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const debounced = useCallback(
    (...args: TArgs) => {
      cancel();

      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, cancel, delay],
  );

  useEffect(() => cancel, [cancel]);

  return debounced;
}
