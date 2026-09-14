'use client';

import { Link, usePathname } from '@/shared/i18n/navigation';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import React from 'react';

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

function BreadcrumbLink({ href, title }: Readonly<{ href: string; title: string }>) {
  const pathname = usePathname();
  const stripped = pathname.replace(/^\/(en|vi)/, '') || '/';
  const isActive = stripped === href;

  const handleClick = (e: React.MouseEvent) => {
    if (isActive) e.preventDefault();
  };

  return (
    <Link href={href} prefetch={false} onClick={handleClick}>
      {title}
    </Link>
  );
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const antdItems: ItemType[] = items.map(item => ({
    title: item.href ? <BreadcrumbLink href={item.href} title={item.title} /> : <span>{item.title}</span>,
    key: item.title,
  }));

  return (
    <AntdBreadcrumb className='custom-breadcrumb mt-1.5!' items={antdItems} style={{ margin: 0, lineHeight: 1 }} />
  );
};
