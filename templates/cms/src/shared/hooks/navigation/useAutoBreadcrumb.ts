'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { usePathname } from '@/shared/i18n/navigation';
import type { BreadcrumbItem } from '@/shared/sections/breadcrumb';
import { useEffect } from 'react';
import { useBreadcrumbContext } from './useBreadcrumb';

const SEGMENT_LABELS: Record<string, string> = {
  'media-library': 'Media Library',
  users: 'Users',
  profile: 'Profile',
  sessions: 'Sessions',
  dashboard: 'Dashboard',
  stores: 'Stores',
  roles: 'Roles',
  permissions: 'Permissions',
};

function capitalizeSegment(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const withoutLocale = pathname.replace(/^\/(en|vi)/, '') || '/';
  const segments = withoutLocale.split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === 'dashboard') return [];

  const items: BreadcrumbItem[] = [{ title: 'Dashboard', href: APP_HREFS.DASHBOARD }];

  let accumulated = '';
  segments.forEach((seg, idx) => {
    accumulated += `/${seg}`;
    const isLast = idx === segments.length - 1;
    const label = SEGMENT_LABELS[seg] ?? capitalizeSegment(seg);
    items.push(isLast ? { title: label } : { title: label, href: accumulated });
  });

  return items;
}

export function useAutoBreadcrumb() {
  const pathname = usePathname();
  const { setItems } = useBreadcrumbContext();

  useEffect(() => {
    const items = buildBreadcrumbs(pathname);
    setItems(items);
    return () => setItems([]);
  }, [pathname, setItems]);
}
