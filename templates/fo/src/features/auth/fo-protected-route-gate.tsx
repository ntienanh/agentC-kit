'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { buildAuthContinuationHref } from './auth-continuation';
import type { LoginResponse } from './api';
import { resolveMvpFoRouteGate } from './rbac-mvp-contract';

type FoProtectedRouteGateProps = {
  readonly href: string;
  readonly session: LoginResponse | null;
  readonly children: React.ReactNode;
};

export function FoProtectedRouteGate({ href, session, children }: FoProtectedRouteGateProps) {
  const outcome = resolveMvpFoRouteGate(href, Boolean(session?.jwt));

  if (outcome !== 'login-required') return <>{children}</>;

  const loginHref = buildAuthContinuationHref('/login', href);
  const registerHref = buildAuthContinuationHref('/register', href);

  return (
    <main className='page-shell'>
      <section className='mx-auto max-w-3xl'>
        <Card className='border-primary/20 bg-primary/5'>
          <CardHeader>
            <Badge variant='accent' className='w-fit'>Login required</Badge>
            <CardTitle className='flex items-center gap-2'><ShieldCheck className='h-5 w-5 text-primary' />Protected customer route</CardTitle>
            <CardDescription>This MVP route requires an authenticated FO customer session before showing profile or notification data.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-3'>
            <Button asChild><Link href={loginHref}>Login to continue</Link></Button>
            <Button asChild variant='outline'><Link href={registerHref}>Create account</Link></Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
