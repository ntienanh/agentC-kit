'use client';

import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
  title?: string;
  subtitle?: string;
}

export function AppLogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="appLogoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="50%" stopColor="var(--color-secondary)" />
          <stop offset="100%" stopColor="var(--color-tertiary)" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="32" height="32" rx="10" stroke="url(#appLogoGrad)" strokeWidth="2.5" />
      <path
        d="M14 20L18 24L26 16"
        stroke="url(#appLogoGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppLogo({
  size = 32,
  showText = true,
  className = '',
  textClassName = '',
  title = 'PORTAL',
  subtitle = 'ENTERPRISE',
}: AppLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 group cursor-pointer ${className}`}>
      <div className="relative flex items-center justify-center rounded-2xl bg-card border border-border p-2 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50">
        <AppLogoIcon size={size} />
      </div>
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-display text-lg font-extrabold tracking-tight text-foreground ${textClassName}`}>
            {title}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-muted-foreground pt-0.5">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
