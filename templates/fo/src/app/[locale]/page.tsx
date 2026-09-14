'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/Button';

export default function HomePage() {
  const t = useTranslations('portal');

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
        <div className="h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>{t('hero.badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          {t('hero.titleLine1')} <br />
          <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
            {t('hero.titleLine2')}
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('hero.description')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/login" className="flex items-center gap-2">
              {t('hero.ctaSignIn')} <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="http://localhost:3333" target="_blank">
              {t('hero.ctaCms')}
            </Link>
          </Button>
        </div>

        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left scroll-mt-20">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">{t('features.nextjs.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('features.nextjs.description')}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">{t('features.bff.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('features.bff.description')}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">{t('features.shadcn.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('features.shadcn.description')}
            </p>
          </div>
        </div>

        <div id="about" className="pt-16 pb-8 border-t border-border/40 text-center space-y-4 max-w-2xl mx-auto scroll-mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('about.title')}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('about.description')}
          </p>
        </div>

        <div id="contact" className="pb-8 text-center space-y-2 text-xs text-muted-foreground scroll-mt-20">
          <p className="font-medium text-foreground">{t('contact.title')}</p>
          <p>
            {t('contact.description')}{' '}
            <a href="mailto:support@example.com" className="underline hover:text-primary">
              support@example.com
            </a>{' '}
            {t('contact.orPhone')}{' '}
            <a href="tel:+15550192834" className="underline hover:text-primary">
              +1 (555) 019-2834
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
