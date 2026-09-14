import { Compass, Home, LayoutDashboard, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[75vh] px-4 py-20 flex flex-col justify-center items-center text-center">
      <div className="relative max-w-xl w-full rounded-[2.5rem] border border-border/80 bg-card/90 backdrop-blur-md p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <Compass className="h-10 w-10 animate-pulse" />
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            404 - Page Not Found
          </span>
          <h1 className="font-display text-4xl font-semibold text-foreground sm:text-5xl">
            This page is unavailable
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            The page, documentation, or portal resource you were searching for has been moved or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Explore Features
          </Link>
        </div>
      </div>
    </main>
  );
}
