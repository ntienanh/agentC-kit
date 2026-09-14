'use client';

import { Spin } from 'antd';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';

interface NavigationLoadingContextValue {
  startLoading: () => void;
  stopLoading: () => void;
}

export const NavigationLoadingContext = createContext<NavigationLoadingContextValue>({
  startLoading: () => {},
  stopLoading: () => {},
});

const NAVIGATION_LOADING_TIMEOUT_MS = 3000;

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLoadingTimeout = useCallback(() => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const stopLoading = useCallback(() => {
    clearLoadingTimeout();
    setLoading(false);
  }, [clearLoadingTimeout]);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      stopLoading();
    }
  }, [pathname, stopLoading]);

  useEffect(() => stopLoading, [stopLoading]);

  const startLoading = useCallback(() => {
    clearLoadingTimeout();
    setLoading(true);
    timeoutRef.current = setTimeout(stopLoading, NAVIGATION_LOADING_TIMEOUT_MS);
  }, [clearLoadingTimeout, stopLoading]);

  return (
    <NavigationLoadingContext.Provider value={{ startLoading, stopLoading }}>
      <Spin spinning={loading} size='large' fullscreen />
      {children}
    </NavigationLoadingContext.Provider>
  );
}
