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
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schema';
import { resetPassword } from '@/lib/api-client';
import { appToast } from '@/lib/toast';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const [done, setDone] = useState(false);
  const [nextPath, setNextPath] = useState('/account');
  const loginHref = buildAuthContinuationHref('/login', nextPath);
  const forgotPasswordHref = buildAuthContinuationHref('/forgot-password', nextPath);
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) form.setValue('token', token, { shouldDirty: false, shouldTouch: false });
    setNextPath(resolveAuthContinuation(params.get('next')));
  }, [form]);

  async function onSubmit(values: ResetPasswordFormValues) {
    try {
      const response = await resetPassword(values);
      setDone(true);
      appToast.success(response.data?.message || 'Password reset successfully.');
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : 'Unable to reset password.');
    }
  }

  return (
    <AuthRecoveryShell
      eyebrow={t('resetPassword.eyebrow')}
      title={t('resetPassword.heroTitle')}
      description={t('resetPassword.heroDescription')}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link className="font-semibold text-accent hover:text-accent-press" href={loginHref}>
            {t('resetPassword.backToSignIn')}
          </Link>
          <Link className="font-semibold text-accent hover:text-accent-press" href={forgotPasswordHref}>
            {t('resetPassword.requestNewLink')}
          </Link>
        </div>
      }
    >
      <div data-testid="recovery-reset-page" className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{t('resetPassword.formTag')}</p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{t('resetPassword.title')}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{t('resetPassword.subtitle')}</p>
        </div>
        {done ? (
          <div data-testid="recovery-reset-confirmation" className="rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-foreground">
            <p className="font-semibold text-success">{t('resetPassword.doneTitle')}</p>
            <p className="mt-1">{t('resetPassword.doneMessage')}</p>
          </div>
        ) : (
          <form className="space-y-3.5 sm:space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="token">{t('resetPassword.tokenLabel')}</Label>
              <Input
                id="token"
                autoComplete="one-time-code"
                spellCheck={false}
                aria-invalid={form.formState.errors.token ? 'true' : 'false'}
                aria-describedby={form.formState.errors.token ? 'reset-token-error' : undefined}
                {...form.register('token')}
              />
              {form.formState.errors.token && (
                <p id="reset-token-error" className="text-xs text-destructive mt-1" role="alert">
                  {form.formState.errors.token.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="newPassword">{t('resetPassword.newPasswordLabel')}</Label>
              <Input
                data-testid="recovery-reset-password-input"
                id="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={form.formState.errors.newPassword ? 'true' : 'false'}
                aria-describedby={form.formState.errors.newPassword ? 'reset-password-error' : undefined}
                placeholder={t('resetPassword.newPasswordPlaceholder')}
                {...form.register('newPassword')}
              />
              {form.formState.errors.newPassword && (
                <p id="reset-password-error" className="text-xs text-destructive mt-1" role="alert">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="confirmPassword">{t('resetPassword.confirmPasswordLabel')}</Label>
              <Input
                data-testid="recovery-reset-confirm-input"
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={form.formState.errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={form.formState.errors.confirmPassword ? 'reset-confirm-password-error' : undefined}
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p id="reset-confirm-password-error" className="text-xs text-destructive mt-1" role="alert">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button data-testid="recovery-reset-submit-button" type="submit" className="w-full bg-accent text-white hover:bg-accent-press" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t('resetPassword.submitting') : t('resetPassword.submit')}
            </Button>
          </form>
        )}
      </div>
    </AuthRecoveryShell>
  );
}
