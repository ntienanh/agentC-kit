'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { buildAuthContinuationHref, resolveAuthContinuation } from '@/features/auth/auth-continuation';
import { AuthRecoveryShell } from '@/features/auth/auth-recovery-shell';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schema';
import { forgotPassword } from '@/lib/api-client';
import { appToast } from '@/lib/toast';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [sent, setSent] = useState(false);
  const [nextPath, setNextPath] = useState('/account');
  const loginHref = buildAuthContinuationHref('/login', nextPath);
  const resetPasswordHref = buildAuthContinuationHref('/reset-password', nextPath);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(resolveAuthContinuation(params.get('next')));
  }, []);

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      const response = await forgotPassword(values);
      setSent(true);
      appToast.success(response.data?.message || 'Reset instructions sent if the email exists.');
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : 'Unable to request password reset.');
    }
  }

  return (
    <AuthRecoveryShell
      eyebrow={t('forgotPassword.eyebrow')}
      title={t('forgotPassword.heroTitle')}
      description={t('forgotPassword.heroDescription')}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link className="font-semibold text-accent hover:text-accent-press" href={loginHref}>
            {t('forgotPassword.backToSignIn')}
          </Link>
          <Link className="font-semibold text-accent hover:text-accent-press" href={resetPasswordHref}>
            {t('forgotPassword.haveLink')}
          </Link>
        </div>
      }
    >
      <div data-testid="recovery-forgot-page" className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{t('forgotPassword.formTag')}</p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{t('forgotPassword.title')}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{t('forgotPassword.subtitle')}</p>
        </div>
        {sent ? (
          <div data-testid="recovery-forgot-confirmation" className="rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-foreground">
            <p className="font-semibold text-success">{t('forgotPassword.sentTitle')}</p>
            <p className="mt-1">{t('forgotPassword.sentMessage')}</p>
          </div>
        ) : (
          <form className="space-y-3.5 sm:space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email">{t('forgotPassword.emailLabel')}</Label>
              <Input
                data-testid="recovery-forgot-email-input"
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                aria-invalid={form.formState.errors.email ? 'true' : 'false'}
                aria-describedby={form.formState.errors.email ? 'recovery-email-error' : undefined}
                placeholder={t('forgotPassword.emailPlaceholder')}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p id="recovery-email-error" className="text-xs text-destructive mt-1" role="alert">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button data-testid="recovery-forgot-submit-button" type="submit" className="w-full bg-accent text-white hover:bg-accent-press" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
            </Button>
          </form>
        )}
      </div>
    </AuthRecoveryShell>
  );
}
