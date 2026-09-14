'use client';

import { AlertOctagon, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled global root error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
            <AlertOctagon className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-destructive bg-destructive/10 px-3 py-1 rounded-full">
              Global Application Error
            </span>
            <h1 className="font-display text-3xl font-bold">Portal Service Interrupted</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error.message || 'A critical application error occurred. We apologize for the inconvenience.'}
            </p>
            {error.digest ? (
              <p className="text-xs font-mono text-muted-foreground/60">Digest: {error.digest}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try restoring application
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/';
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Reload to Home Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
