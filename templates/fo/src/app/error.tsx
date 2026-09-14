'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled segment error caught by App Router error boundary:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] px-4 py-16 flex flex-col justify-center items-center text-center">
      <div className="relative max-w-lg w-full rounded-3xl border border-border/80 bg-card p-8 shadow-xl space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
          <AlertTriangle className="h-8 w-8 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-destructive/10 text-destructive">
            Something went wrong
          </span>
          <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Sanctuary view encountered a glitch
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {error.message || 'An unexpected rendering error occurred while loading this page segment.'}
          </p>
          {error.digest ? (
            <p className="text-xs font-mono text-muted-foreground/60">
              Error Digest: {error.digest}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
