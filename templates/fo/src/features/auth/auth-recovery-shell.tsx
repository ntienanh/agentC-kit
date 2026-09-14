import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';

type AuthRecoveryShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthRecoveryShell({ eyebrow, title, description, children, footer }: AuthRecoveryShellProps) {
  return (
    <main className='relative isolate min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-8 lg:py-10'>
      <div className='pointer-events-none absolute inset-0' aria-hidden='true'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(242,100,25,0.13),transparent_28%),radial-gradient(circle_at_84%_76%,rgba(216,167,167,0.16),transparent_34%)]' />
      </div>

      <section className='container-premium relative z-10 flex min-h-[calc(100dvh-3rem)] items-center justify-center lg:grid lg:grid-cols-[1.05fr_0.95fr] gap-8 sm:min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-5rem)]'>
        <div className='hidden lg:block mx-auto max-w-xl space-y-6 text-center lg:mx-0 lg:text-left'>
          <Link href='/login' className='inline-flex min-h-10 items-center gap-2 rounded-full text-sm font-semibold text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'>
            <ArrowLeft className='h-4 w-4' aria-hidden='true' />Back to sign in
          </Link>
          <div className='space-y-4'>
            <p className='text-xs font-bold uppercase tracking-[0.18em] text-accent'>{eyebrow}</p>
            <h1 className='font-display text-5xl font-semibold leading-[0.95] text-foreground sm:text-6xl'>{title}</h1>
            <p className='mx-auto max-w-lg text-sm leading-7 text-muted-foreground sm:text-base lg:mx-0'>{description}</p>
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='rounded-2xl border border-border/70 bg-card/75 p-4 text-left shadow-sm backdrop-blur-md'><ShieldCheck className='mb-3 h-5 w-5 text-accent' aria-hidden='true' /><p className='text-sm font-semibold text-foreground'>Private by design</p><p className='mt-1 text-xs leading-5 text-muted-foreground'>We keep recovery responses neutral to protect your account.</p></div>
            <div className='rounded-2xl border border-border/70 bg-card/75 p-4 text-left shadow-sm backdrop-blur-md'><LockKeyhole className='mb-3 h-5 w-5 text-accent' aria-hidden='true' /><p className='text-sm font-semibold text-foreground'>Return with confidence</p><p className='mt-1 text-xs leading-5 text-muted-foreground'>Once complete, you can return to your account and profile.</p></div>
          </div>
        </div>

        <section className='mx-auto w-full max-w-[480px] rounded-[2rem] border border-white/70 bg-card/95 p-5 shadow-[0_28px_80px_rgba(44,38,32,0.16)] backdrop-blur-xl sm:p-7'>
          {children}
          <div className='mt-6 border-t border-border/70 pt-5'>{footer}</div>
        </section>
      </section>
    </main>
  );
}
