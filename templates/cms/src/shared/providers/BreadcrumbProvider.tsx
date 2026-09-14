'use client';

import React, { useMemo, useState } from 'react';
import { BreadcrumbContext, type BreadcrumbContextValue } from './BreadcrumbContext';

export const BreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<BreadcrumbContextValue['items']>([]);

  const value = useMemo<BreadcrumbContextValue>(() => ({ items, setItems }), [items, setItems]);

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
};
