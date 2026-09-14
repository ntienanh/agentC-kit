'use client';

import { BreadcrumbItem } from '@/shared/sections/breadcrumb';
import { createContext } from 'react';

export interface BreadcrumbContextValue {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);
