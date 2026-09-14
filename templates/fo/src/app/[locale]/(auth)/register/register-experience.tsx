'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CalendarDays, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { buildAuthContinuationHref, resolveAuthContinuation } from '@/features/auth/auth-continuation';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schema';
import { register } from '@/lib/api-client';
import { appToast } from '@/lib/toast';

export function RegisterExperience() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });
  const { errors, isSubmitting } = form.formState;
  const nextPath = useMemo(() => resolveAuthContinuation(searchParams.get('next')), [searchParams]);
  const loginHref = buildAuthContinuationHref('/login', nextPath);

  const registerHighlights = useMemo(
    () => [
      { icon: CalendarDays, label: t('register.highlights.fast') },
      { icon: Sparkles, label: t('register.highlights.custom') },
      { icon: ShieldCheck, label: t('register.highlights.standards') },
    ],
    [t],
  );

  async function onSubmit(values: RegisterFormValues) {
    try {
      const response = await register(values);
      appToast.success(response.data?.message || response.message || 'Account created. Please login.');
      const params = new URLSearchParams({ email: values.email });
      params.set('next', nextPath);
      router.replace(`/login?${params.toString()}`);
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : 'Unable to register.');
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
            {t('register.badge')}
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold leading-[0.95] text-foreground min-[380px]:text-5xl sm:text-6xl lg:text-7xl">
              {t('register.heroTitle')}
            </h1>
            <p className="mx-auto max-w-lg text-sm leading-7 text-muted-foreground sm:text-base lg:mx-0">
              {t('register.heroDescription')}
            </p>
          </div>

          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-3 text-left lg:justify-start">
            {registerHighlights.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <item.icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-lg rounded-[1.75rem] border border-white/70 bg-card/95 p-5 shadow-[0_28px_80px_rgba(44,38,32,0.16)] backdrop-blur-xl sm:rounded-[2rem] sm:p-7">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{t('register.formTag')}</p>
            <h2 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{t('register.title')}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{t('register.subtitle')}</p>
          </div>

          <div className="space-y-5">
            <form className="space-y-3.5 sm:space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="register-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                  {t('register.emailLabel')}
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'register-email-error' : undefined}
                  placeholder={t('register.emailPlaceholder')}
                  {...form.register('email')}
                />
                {errors.email && (
                  <p id="register-email-error" className="text-xs text-destructive mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="register-password" className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-accent" aria-hidden="true" />
                  {t('register.passwordLabel')}
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'register-password-error register-password-help' : 'register-password-help'}
                  placeholder={t('register.passwordPlaceholder')}
                  {...form.register('password')}
                />
                <p id="register-password-help" className="text-xs text-muted-foreground">{t('register.passwordHelp')}</p>
                {errors.password && (
                  <p id="register-password-error" className="text-xs text-destructive mt-1" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="register-confirm-password" className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-accent" aria-hidden="true" />
                  {t('register.confirmPasswordLabel')}
                </Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  {...form.register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p id="register-confirm-password-error" className="text-xs text-destructive mt-1" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-accent text-white hover:bg-accent-press" disabled={isSubmitting}>
                {isSubmitting ? t('register.submitting') : t('register.submit')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>

            <div className="rounded-2xl border border-border/70 bg-muted/25 p-4 text-center text-sm text-muted-foreground">
              {t('register.hasAccount')}{' '}
              <Link className="inline-flex min-h-10 items-center rounded-full font-bold text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40" href={loginHref}>
                {t('register.signIn')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
