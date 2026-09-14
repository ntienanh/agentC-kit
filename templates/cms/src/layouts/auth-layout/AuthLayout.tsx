'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ReactNode } from 'react';

export function LoopLogo({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M16.243 7.757a4 4 0 00-5.657 0L7.757 10.586a4 4 0 000 5.657l2.829 2.828a4 4 0 005.657 0l2.828-2.828a4 4 0 000-5.657l-2.828-2.829zm-4.243 1.414a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-2.829 2.829a2 2 0 01-2.828 0l-2.829-2.829a2 2 0 010-2.828l2.829-2.829z'
        fill='currentColor'
      />
    </svg>
  );
}

export function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className='bg-background relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-3! py-6! sm:px-6! sm:py-10!'>
      <div className='from-primary/15 pointer-events-none absolute -top-24 left-1/2 h-[22rem] w-[32rem] -translate-x-1/2 rounded-full bg-gradient-to-tr via-indigo-500/15 to-purple-500/10 blur-3xl' />
      <div className='via-primary/10 pointer-events-none absolute -right-20 -bottom-24 h-[18rem] w-[24rem] rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl' />

      <div
        className='pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.18]'
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '2.25rem 2.25rem',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className='border-border/80 bg-card/95 relative z-10 flex w-full overflow-hidden rounded-[24px] border p-2 shadow-2xl backdrop-blur-xl sm:rounded-[28px] sm:p-4'
        style={{ maxWidth: '62rem', minHeight: '38rem' }}
      >
        <div className='relative hidden p-2 lg:flex lg:w-[45%]'>
          <div className='border-inverse-border/30 bg-inverse-surface text-inverse-foreground relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[20px] border p-10'>
            <Image
              src='/signin_branding.jpg'
              alt='CMS Operations Flow Visualization'
              fill
              className='pointer-events-none object-cover opacity-85 transition-opacity duration-700 select-none hover:opacity-95'
              priority
            />

            <div className='absolute inset-0 z-5 bg-gradient-to-t from-black/90 via-black/30 to-black/60' />

            <div className='z-10 flex items-center gap-2 self-start font-sans text-lg font-bold tracking-tight text-white drop-shadow-md select-none'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-emerald-400' />
              Admin Console
            </div>

            <div className='flex-1' />

            <div className='z-10 flex flex-col gap-2.5 self-start drop-shadow-lg'>
              <h2 className='text-3xl leading-tight font-extrabold tracking-tight text-white select-none'>
                Unified Back-Office <br />
                <span className='from-primary bg-gradient-to-r via-indigo-400 to-cyan-300 bg-clip-text text-transparent'>
                  Operations Platform.
                </span>
              </h2>
              <p className='max-w-[320px] text-xs leading-relaxed font-normal text-zinc-300 opacity-90'>
                Centralized management control plane for multi-store operations, real-time analytics, user access
                control, and transaction monitoring.
              </p>
            </div>
          </div>
        </div>

        <div className='relative flex w-full flex-col justify-between px-4 py-6 sm:px-12 sm:py-10 lg:w-[55%] lg:px-16'>
          <div className='border-border/40 mb-6 flex w-full items-center justify-between border-b pb-4 lg:border-none lg:pb-0'>
            <div className='flex items-center gap-2.5 lg:hidden'>
              <div className='from-primary shadow-primary/20 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br to-indigo-600 text-white shadow-md'>
                <LoopLogo className='h-4 w-4' />
              </div>
              <div>
                <div className='text-heading text-sm font-bold tracking-tight select-none'>Admin Console</div>
                <div className='flex items-center gap-1 text-[10px] font-medium text-emerald-500'>
                  <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500' />
                  System Operational
                </div>
              </div>
            </div>
            <div className='text-muted-foreground/80 ml-auto flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase select-none'>
              <span className='hidden sm:inline'>256-Bit</span> Encrypted
            </div>
          </div>

          <div className='my-auto w-full'>{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
