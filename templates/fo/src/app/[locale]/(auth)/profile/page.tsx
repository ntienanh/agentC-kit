'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Save, Shield, ShieldCheck, Upload, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { changePassword, getProfile, sendEmailVerification, updateProfile } from '@/lib/api-client';
import { compressImage, formatFileSize } from '@/lib/image-compressor';
import { appToast } from '@/lib/toast';
import { FoProtectedRouteGate } from '@/features/auth/fo-protected-route-gate';
import { useFoSession } from '@/features/auth/use-fo-session';
import { changePasswordSchema, profileSchema, type ChangePasswordFormValues, type ProfileFormValues } from '@/features/auth/schema';
import type { ProfileResponse } from '@/features/auth/api';

export default function ProfilePage() {
  const t = useTranslations('auth');
  const { session, hasHydratedSession, setSession } = useFoSession();
  const [profile, setProfile] = useState<ProfileResponse['data'] | null>(null);
  const [isProfilePending, setIsProfilePending] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);

  const profileForm = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), defaultValues: { displayName: '', phone: '', avatar: '' } });
  const passwordForm = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' } });

  async function handleAvatarFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      appToast.error('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setIsCompressingAvatar(true);
    try {
      const result = await compressImage(file, { maxSizeBytes: 500 * 1024 });
      profileForm.setValue('avatar', result.dataUrl, { shouldDirty: true, shouldValidate: true });

      if (result.didCompress) {
        appToast.info(
          `Avatar compressed from ${formatFileSize(result.originalSizeBytes)} to ${formatFileSize(result.compressedSizeBytes)} (< 500KB).`,
        );
      } else {
        appToast.success(`Avatar image loaded (${formatFileSize(result.compressedSizeBytes)}).`);
      }
    } catch {
      appToast.error('Unable to compress avatar image.');
    } finally {
      setIsCompressingAvatar(false);
      e.target.value = '';
    }
  }

  useEffect(() => {
    async function load() {
      if (!hasHydratedSession) return;
      if (!session?.jwt) {
        setIsProfilePending(false);
        return;
      }

      try {
        const profileRes = await getProfile(session.jwt);
        const nextProfile = profileRes.data ?? null;
        setProfile(nextProfile);
        profileForm.reset({
          displayName: nextProfile?.displayName ?? '',
          phone: nextProfile?.phone ?? '',
          avatar: nextProfile?.avatar ?? '',
        });
      } catch (error) {
        appToast.error(error instanceof Error ? error.message : 'Unable to load profile.');
      } finally {
        setIsProfilePending(false);
      }
    }

    void load();
  }, [hasHydratedSession, profileForm, session?.jwt]);

  async function handleProfileSubmit(values: ProfileFormValues) {
    if (!session?.jwt) return appToast.error('Login is required.');
    setIsSavingProfile(true);
    try {
      const response = await updateProfile(session.jwt, values);
      setProfile(response.data ?? null);
      if (session.user && response.data) {
        const nextSession = { ...session, user: { ...session.user, email: response.data.email, accessibleStoreIds: response.data.accessibleStoreIds } };
        setSession(nextSession);
      }
      appToast.success('Profile updated.');
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : 'Unable to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(values: ChangePasswordFormValues) {
    if (!session?.jwt) return appToast.error('Login is required.');
    setIsChangingPassword(true);
    try {
      await changePassword(session.jwt, values);
      passwordForm.reset();
      appToast.success('Password changed.');
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : 'Unable to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleVerifyEmail() {
    const email = profile?.email ?? session?.user?.email;
    if (!email) return appToast.error('Email is required first.');
    setIsVerifyingEmail(true);
    try {
      const response = await sendEmailVerification({ email });
      appToast.success(response.data?.message || 'Verification email requested.');
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : 'Unable to request verification email.');
    } finally {
      setIsVerifyingEmail(false);
    }
  }

  if (!hasHydratedSession) {
    return (
      <main className="page-shell">
        <section className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">{t('profile.badge')}</Badge>
              <CardTitle>{t('profile.checkingSession')}</CardTitle>
              <CardDescription>{t('profile.checkingSessionDesc')}</CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    );
  }

  if (!session?.jwt) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.loginRequired')}</CardTitle>
              <CardDescription>{t('profile.loginRequiredDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild><Link href="/login">{t('login.submit')}</Link></Button>
              <Button asChild variant="outline"><Link href="/register">{t('register.formTag')}</Link></Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <FoProtectedRouteGate href="/profile" session={session}>
      <main className="page-shell">
        <div className="container-premium space-y-6">
          <header className="flex flex-col justify-between gap-4 rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm sm:flex-row sm:items-end sm:p-8">
            <div className="max-w-2xl space-y-3">
              <Badge variant="outline" className="w-fit bg-background">{t('profile.badge')}</Badge>
              <h1 className="font-display text-4xl font-semibold leading-[0.95] text-foreground sm:text-5xl">{t('profile.title')}</h1>
              <p className="text-sm leading-7 text-muted-foreground">{t('profile.description')}</p>
            </div>
            <Button asChild variant="outline"><Link href="/account">{t('profile.backToAccount')}</Link></Button>
          </header>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" /><CardTitle>{t('profile.cardTitle')}</CardTitle></div>
                  <CardDescription>{isProfilePending ? t('profile.loadingProfile') : profile?.email ?? session.user.email}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={profile?.emailVerified ? 'accent' : 'secondary'}>{profile?.emailVerified ? t('profile.emailVerified') : t('profile.emailNotVerified')}</Badge>
                    <Badge variant={profile?.phone ? 'accent' : 'secondary'}>{profile?.phone ? t('profile.phoneOnFile') : t('profile.addPhone')}</Badge>
                    <Badge variant={profile?.displayName ? 'accent' : 'secondary'}>{profile?.displayName ? t('profile.profileNamed') : t('profile.addDisplayName')}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">{t('profile.displayNameLabel')}</Label>
                    <Input id="displayName" {...profileForm.register('displayName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('profile.phoneLabel')}</Label>
                    <Input id="phone" {...profileForm.register('phone')} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="avatar">{t('profile.avatarLabel')}</Label>
                      <label htmlFor="avatar-file-upload" className="cursor-pointer text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                        <Upload className="h-3.5 w-3.5" />
                        {isCompressingAvatar ? t('profile.compressingAvatar') : t('profile.uploadAvatar')}
                      </label>
                      <input
                        id="avatar-file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarFileSelect}
                        disabled={isCompressingAvatar}
                      />
                    </div>
                    <Input id="avatar" placeholder="https://... or upload image above" {...profileForm.register('avatar')} />
                    {profileForm.watch('avatar') ? (
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-border p-2 bg-secondary/10">
                        <img
                          src={profileForm.watch('avatar')}
                          alt="Avatar preview"
                          className="h-10 w-10 rounded-full object-cover border border-border/80"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="text-xs text-muted-foreground truncate max-w-52 sm:max-w-xs">
                          {profileForm.watch('avatar')?.startsWith('data:') ? 'Compressed Data Image (<500KB)' : profileForm.watch('avatar')}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={profileForm.handleSubmit(handleProfileSubmit)} disabled={isSavingProfile}><Save className="h-4 w-4" />{isSavingProfile ? t('profile.savingProfile') : t('profile.saveProfile')}</Button>
                    <Button type="button" variant="outline" disabled={isVerifyingEmail} onClick={() => void handleVerifyEmail()}><ShieldCheck className="h-4 w-4" />{isVerifyingEmail ? t('profile.sendingVerification') : t('profile.verifyEmail')}</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /><CardTitle>{t('profile.changePasswordTitle')}</CardTitle></div>
                  <CardDescription>{t('profile.changePasswordDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('profile.currentPasswordLabel')}</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      autoComplete="current-password" 
                      placeholder={t('profile.currentPasswordPlaceholder')} 
                      aria-invalid={passwordForm.formState.errors.currentPassword ? 'true' : 'false'}
                      aria-describedby={passwordForm.formState.errors.currentPassword ? 'current-password-error' : undefined}
                      {...passwordForm.register('currentPassword')} 
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p id="current-password-error" role="alert" className="text-xs text-destructive font-medium">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('profile.newPasswordLabel')}</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      autoComplete="new-password" 
                      placeholder={t('profile.newPasswordPlaceholder')} 
                      aria-invalid={passwordForm.formState.errors.newPassword ? 'true' : 'false'}
                      aria-describedby={passwordForm.formState.errors.newPassword ? 'new-password-error' : undefined}
                      {...passwordForm.register('newPassword')} 
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p id="new-password-error" role="alert" className="text-xs text-destructive font-medium">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">{t('profile.confirmNewPasswordLabel')}</Label>
                    <Input 
                      id="confirmNewPassword" 
                      type="password" 
                      autoComplete="new-password" 
                      placeholder={t('profile.confirmNewPasswordPlaceholder')} 
                      aria-invalid={passwordForm.formState.errors.confirmNewPassword ? 'true' : 'false'}
                      aria-describedby={passwordForm.formState.errors.confirmNewPassword ? 'confirm-new-password-error' : undefined}
                      {...passwordForm.register('confirmNewPassword')} 
                    />
                    {passwordForm.formState.errors.confirmNewPassword && (
                      <p id="confirm-new-password-error" role="alert" className="text-xs text-destructive font-medium">{passwordForm.formState.errors.confirmNewPassword.message}</p>
                    )}
                  </div>
                  <Button onClick={passwordForm.handleSubmit(handlePasswordSubmit)} disabled={isChangingPassword}><ShieldCheck className="h-4 w-4" />{isChangingPassword ? t('profile.changingPassword') : t('profile.changePasswordSubmit')}</Button>
                  <p className="text-sm text-muted-foreground">{t('profile.needRecovery')} <Link href="/forgot-password" className="font-semibold text-accent hover:text-accent-press">{t('profile.requestResetLink')}</Link>.</p>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-6">
              <Card data-testid="user-account-details-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <CardTitle>{t('profile.accountDetails')}</CardTitle>
                    </div>
                    <Badge variant="accent" className="font-mono font-bold">
                      {profile?.role?.name ?? (typeof profile?.role === 'string' ? profile.role : 'USER')}
                    </Badge>
                  </div>
                  <CardDescription>{t('profile.accountDetailsDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-secondary/10 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('profile.userId')}</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                        {profile?.id ?? session.user.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('profile.email')}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground truncate">
                        {profile?.email ?? session.user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('profile.assignedRole')}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {profile?.role?.name ?? (typeof profile?.role === 'string' ? profile.role : 'USER')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('profile.emailVerification')}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {profile?.emailVerified ? t('profile.verified') : t('profile.unverified')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.guidelinesTitle')}</CardTitle>
                  <CardDescription>{t('profile.guidelinesDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{t('profile.guideline1')}</p>
                  <p>{t('profile.guideline2')}</p>
                  <p>{t('profile.guideline3')}</p>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </FoProtectedRouteGate>
  );
}
