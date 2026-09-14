'use client';

import { Link, usePathname } from '@/shared/i18n/navigation';
import { useNavigationLoading } from '@/shared/providers';
import type { MouseEvent } from 'react';

interface SidebarLinkProps {
  href: string;
  label: string;
}

export function SidebarLink({ href, label }: Readonly<SidebarLinkProps>) {
  const pathname = usePathname();
  const stripped = pathname.replace(/^\/(en|vi)/, '') || '/';
  const isActive = stripped === href || stripped.startsWith(`${href}/`);
  const { startLoading, stopLoading } = useNavigationLoading();

  const handleClick = (event: MouseEvent) => {
    if (isActive) {
      event.preventDefault();
      stopLoading();
      return;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    startLoading();
  };

  return (
    <Link href={href} prefetch={false} onClick={handleClick}>
      <span>{label}</span>
    </Link>
  );
}
