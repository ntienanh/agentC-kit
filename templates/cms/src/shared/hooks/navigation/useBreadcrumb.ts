'use client';

import { BreadcrumbContext } from '@/shared/providers/BreadcrumbContext';
import { BreadcrumbItem } from '@/shared/sections/breadcrumb';
import { useContext, useEffect } from 'react';

export const useBreadcrumbContext = () => {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error('useBreadcrumbContext must be used within BreadcrumbProvider');
  return ctx;
};

export const useBreadcrumb = (items: BreadcrumbItem[]) => {
  const { setItems } = useBreadcrumbContext();
  const itemsKey = JSON.stringify(items);

  useEffect(() => {
    setItems(items);
    return () => setItems([]);
  }, [items, itemsKey, setItems]);
};
