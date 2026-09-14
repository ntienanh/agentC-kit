'use client';

import { ComponentGuardProps } from './types';

export function ComponentGuard({ children, when, fallback = null }: Readonly<ComponentGuardProps>) {
  if (!when) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
