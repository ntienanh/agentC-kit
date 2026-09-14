'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CalendarDays, CheckCircle2, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { buildAuthContinuationHref, resolveAuthContinuation } from '@/features/auth/auth-continuation';
import { loginSchema, type LoginFormValues } from '@/features/auth/schema';
import { readAuthSession, saveAuthSession } from '@/features/auth/session';
import { login } from '@/lib/api-client';
import { appToast } from '@/lib/toast';

export function LoginExperience() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });
  const { errors, isSubmitting } = form.formState;
  const nextPath = useMemo(() => resolveAuthContinuation(searchParams.get('next')), [searchParams]);
  const forgotPasswordHref = buildAuthContinuationHref('/forgot-password', nextPath);
  const registerHref = buildAuthContinuationHref('/register', nextPath);

  const loginHighlights = useMemo(
    () => [
      { icon: CalendarDays, label: t('login.highlights.manage') },
      { icon: Sparkles, label: t('login.highlights.save') },
      { icon: ShieldCheck, label: t('login.highlights.secure') },
    ],
    [t],
  );

  useEffect(() => {
    const email = searchParams.get('email');
    if (!email) return;
    form.setValue('identifier', email, { shouldDirty: false, shouldTouch: false });
  }, [form, searchParams]);

  useEffect(() => {
    const currentSession = readAuthSession();
    if (!currentSession) return;
    setSignedInEmail(currentSession.user.email);
    const timeout = window.setTimeout(() => router.replace(nextPath), 500);
    return () => window.clearTimeout(timeout);
  }, [nextPath, router]);

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await login(values);
      saveAuthSession(response);
      setSignedInEmail(response.user.email);
      appToast.success('Login successful.');
      router.replace(nextPath);
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : 'Unable to login.');
    }
  }

  return (
    <main className="relative isolate min-h-svh overflow-x-hidden overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.14),transparent_35%)]" />
      </div>

      <section className="container-premium relative z-10 flex min-h-[calc(100svh-3rem)] items-center justify-center lg:grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 sm:min-h-[calc(100svh-4rem)] lg:min-h-[calc(100svh-5rem)]">
        <div className="hidden lg:block mx-auto max-w-xl space-y-5 text-center lg:mx-0 lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {t('login.badge')}
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold leading-[0.95] text-foreground min-[380px]:text-5xl sm:text-6xl lg:text-7xl">
              {t('login.heroTitle')}
            </h1>
            <p className="mx-auto max-w-lg text-sm leading-7 text-muted-foreground sm:text-base lg:mx-0">
              {t('login.heroDescription')}
            </p>
          </div>

          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-3 text-left lg:justify-start">
            {loginHighlights.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <item.icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-lg rounded-[1.75rem] border border-white/70 bg-card/95 p-5 shadow-[0_28px_80px_rgba(44,38,32,0.16)] backdrop-blur-xl sm:rounded-[2rem] sm:p-7">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{t('login.formTag')}</p>
            <h2 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{t('login.title')}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{t('login.subtitle')}</p>
          </div>

          <div className="space-y-5">
            {signedInEmail ? (
              <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-foreground" aria-live="polite">
                <div className="flex items-center gap-2 font-semibold text-success">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {t('login.signedIn')}
                </div>
                <p className="mt-1 break-words">{t('login.redirecting')} ({signedInEmail})</p>
              </div>
            ) : (
              <form className="space-y-3.5 sm:space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="login-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                    {t('login.emailLabel')}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    aria-invalid={errors.identifier ? 'true' : 'false'}
                    aria-describedby={errors.identifier ? 'login-email-error' : undefined}
                    placeholder={t('login.emailPlaceholder')}
                    {...form.register('identifier')}
                  />
                  {errors.identifier && (
                    <p id="login-email-error" className="text-xs text-destructive mt-1" role="alert">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <LockKeyhole className="h-4 w-4 text-accent" aria-hidden="true" />
                      {t('login.passwordLabel')}
                    </Label>
                    <Link className="inline-flex min-h-10 items-center rounded-full text-xs font-semibold text-accent hover:text-accent-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40" href={forgotPasswordHref}>
                      {t('login.forgotPassword')}
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                    placeholder={t('login.passwordPlaceholder')}
                    {...form.register('password')}
                  />
                  {errors.password && (
                    <p id="login-password-error" className="text-xs text-destructive mt-1" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-accent text-white hover:bg-accent-press" disabled={isSubmitting}>
                  {isSubmitting ? t('login.submitting') : t('login.submit')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </form>
            )}

            <div className="rounded-2xl border border-border/70 bg-muted/25 p-4 text-center text-sm text-muted-foreground">
              {t('login.noAccount')}{' '}
              <Link className="inline-flex min-h-10 items-center rounded-full font-bold text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40" href={registerHref}>
                {t('login.createAccount')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
