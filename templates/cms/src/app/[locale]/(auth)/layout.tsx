import { AuthLayout } from '@/layouts/auth-layout';
import React from 'react';

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthLayout>{children}</AuthLayout>;
}
