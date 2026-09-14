'use client';

import React from 'react';
import { ArrowUp, X } from 'lucide-react';

export interface AppNewUpdatesPillProps {
  count: number;
  message?: string;
  onRefresh: () => void;
  onDismiss?: () => void;
  visible?: boolean;
  className?: string;
}

export function AppNewUpdatesPill({
  count,
  message,
  onRefresh,
  onDismiss,
  visible = true,
  className = '',
}: AppNewUpdatesPillProps) {
  if (!visible || count <= 0) return null;

  const displayMessage =
    message ||
    `${count} new update${count > 1 ? 's' : ''} available • Click to refresh`;

  return (
    <div
      className={`sticky top-4 z-50 my-2 flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="group inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-900 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-amber-500/20 hover:shadow-lg dark:text-amber-200">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex cursor-pointer items-center gap-2 focus:outline-none"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white transition-transform group-hover:-translate-y-0.5">
            <ArrowUp className="h-3 w-3" />
          </span>
          <span className="font-semibold">{displayMessage}</span>
        </button>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-1 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-amber-700/70 hover:bg-amber-500/20 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
            aria-label="Dismiss new update alert"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
