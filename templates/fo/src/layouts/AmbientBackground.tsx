'use client';

import React from 'react';

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(72rem,100vw)] h-[36rem] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl" />
      <div className="absolute top-1/4 -right-24 w-[45rem] h-[45rem] bg-gradient-to-bl from-accent/12 via-accent/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-24 w-[42rem] h-[38rem] bg-gradient-to-tr from-primary/10 via-muted/20 to-transparent rounded-full blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
