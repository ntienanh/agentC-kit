'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { login, register } from '@/lib/api-client';
import { appToast } from '@/lib/toast';
import type { LoginResponse } from './api';
import { clearAuthSession, readAuthSession, saveAuthSession } from './session';
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from './schema';

type AuthPanelMode = 'combined' | 'login' | 'register';
type AuthRouteMode = 'login' | 'register';

type JourneyStep = { step: string; title: string; copy: string };
type BlueprintBlock = { title: string; copy: string };

const blueprintByMode: Record<AuthRouteMode, {
  badgeLabel: string;
  heroTitle: string;
  heroDescription: string;
  goal: string;
  flow: JourneyStep[];
  uiNeeds: string[];
  apiNeeds: BlueprintBlock[];
  behaviors: BlueprintBlock[];
}> = {
  login: {
    badgeLabel: 'FO login',
    heroTitle: 'Welcome back to your workspace.',
    heroDescription: 'Đăng nhập là lane identity cốt lõi: form rõ ràng, response auth đúng chuẩn, và redirect continuity sang profile, dashboard, notifications.',
    goal: 'User đăng nhập thành công và tiếp tục đúng route đang làm dở.',
    flow: [
      { step: '01', title: 'Open login', copy: 'Đi từ homepage, profile CTA, hoặc protected route.' },
      { step: '02', title: 'Fill credentials', copy: 'Nhập email + password, form validate required trước khi submit.' },
      { step: '03', title: 'Submit auth', copy: 'FO gọi login API, nhận session/customer identity.' },
      { step: '04', title: 'Persist session', copy: 'Lưu JWT/session để hydrate profile và các protected routes.' },
      { step: '05', title: 'Continue journey', copy: 'Redirect về `next`, `/profile`, `/dashboard` hoặc lane bảo vệ trước đó.' },
    ],
    uiNeeds: [
      'Email input + validation message',
      'Password input + masked value',
      'Login CTA có loading / disabled state',
      'Forgot password link',
      'Register link',
      'Error toast / auth fail message',
      'Success redirect continuity',
    ],
    apiNeeds: [
      { title: 'POST /api/auth/login', copy: 'Submit email/password, nhận token + user identity.' },
      { title: 'GET /api/auth/profile', copy: 'Hydrate profile sau login nếu route tiếp theo cần identity details.' },
      { title: 'POST /api/auth/forgot-password', copy: 'Recovery handoff cho user không nhớ password.' },
    ],
    behaviors: [
      { title: 'Happy path', copy: 'API 200 → save session → toast success → redirect.' },
      { title: 'Validation fail', copy: 'Không gọi API nếu field thiếu hoặc sai format.' },
      { title: 'Auth fail', copy: 'Giữ lại email, show lỗi rõ ràng, cho retry hoặc recovery.' },
      { title: 'Continuity', copy: 'Protected routes sau login phải mở đúng target thay vì về homepage.' },
    ],
  },
  register: {
    badgeLabel: 'FO register',
    heroTitle: 'Create a lightweight FO account.',
    heroDescription: 'Register là bước tạo customer identity để các route profile, dashboard và notifications có continuity ổn định với backend.',
    goal: 'User tạo xong account mới và có thể chuyển ngay sang login hoặc flow kế tiếp.',
    flow: [
      { step: '01', title: 'Open register', copy: 'Đi từ login, homepage profile CTA hoặc protected route pre-auth.' },
      { step: '02', title: 'Fill account form', copy: 'Nhập email, password, confirm password đúng schema.' },
      { step: '03', title: 'Submit register', copy: 'FO gọi register API và tạo USER account mới.' },
      { step: '04', title: 'Prefill login', copy: 'Sau register, email được prefill lại cho login để giảm friction.' },
      { step: '05', title: 'Continue auth journey', copy: 'Đi tiếp login, verify email hoặc forgot/reset nếu cần.' },
    ],
    uiNeeds: [
      'Email input',
      'Password input',
      'Confirm password input',
      'Register CTA có loading state',
      'Link quay về login',
      'Inline validation cho password mismatch',
      'Post-register success state',
    ],
    apiNeeds: [
      { title: 'POST /api/auth/register', copy: 'Create user/customer identity cho FO.' },
      { title: 'POST /api/auth/verify-email', copy: 'Lane kế tiếp nếu project cần verify account.' },
      { title: 'POST /api/auth/login', copy: 'Dùng ngay sau register để bắt đầu protected journeys.' },
    ],
    behaviors: [
      { title: 'Happy path', copy: 'Register success → toast success → reset form → prefill login email.' },
      { title: 'Validation fail', copy: 'Password mismatch hoặc email invalid phải block submit.' },
      { title: 'Duplicate identity', copy: 'Nếu account đã tồn tại, phải hướng user về login thay vì tạo trùng.' },
      { title: 'Backend continuity', copy: 'Identity mới phải dùng được cho session và follow-up.' },
    ],
  },
};

function SessionCard({ session, onLogout }: Readonly<{ session: LoginResponse | null; onLogout: () => void }>) {
  return (
    <Card className='h-full overflow-hidden border-white/50 bg-white/70 shadow-[0_24px_70px_rgba(31,48,40,0.10)] backdrop-blur-xl'>
      <CardHeader>
        <Badge variant='accent' className='w-fit'>Customer access</Badge>
        <CardTitle>Customer FO session</CardTitle>
        <CardDescription>Session này quyết định các route protected như profile, dashboard và notifications.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='rounded-3xl border border-white/60 bg-white/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]'>
          <div className='flex items-center gap-2 text-sm font-medium'><ShieldCheck className='h-4 w-4 text-primary' /> Current session</div>
          {session ? (
            <div className='mt-3 flex items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-semibold text-foreground'>{session.user.email}</p>
                <p className='text-xs text-muted-foreground'>ID: {session.user.id} • Role: {session.user.role?.name ?? 'USER'}</p>
              </div>
              <Button variant='outline' size='sm' onClick={onLogout}>Logout</Button>
            </div>
          ) : (
            <p className='mt-3 text-sm text-muted-foreground'>No active FO session. Public routes vẫn chạy, nhưng profile và dashboard cần login.</p>
          )}
        </div>
        <div className='grid gap-3'>
          {[
            'Profile hub cần session để hydrate summary và user settings.',
            'Dashboard cần identity để truy xuất dữ liệu an toàn.',
            'Notifications lấy customer context từ session.',
          ].map(item => <div key={item} className='rounded-2xl border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground'>{item}</div>)}
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button asChild variant='outline' size='sm'><Link href='/login'>Login</Link></Button>
          <Button asChild variant='outline' size='sm'><Link href='/register'>Register</Link></Button>
          <Button asChild variant='outline' size='sm'><Link href='/profile'>Profile</Link></Button>
          <Button asChild variant='outline' size='sm'><Link href='/dashboard'>Dashboard</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AuthBlueprintRail({ mode }: { mode: AuthRouteMode }) {
  const blueprint = blueprintByMode[mode];

  return (
    <motion.section initial={false} whileHover={{ y: -1 }} transition={{ duration: 0.2 }} className='hidden rounded-[2.25rem] border border-white/45 bg-[linear-gradient(155deg,rgba(39,66,56,0.97),rgba(24,42,35,0.94))] p-8 text-white shadow-[0_30px_90px_rgba(24,45,37,0.24)] lg:flex lg:flex-col lg:justify-between'>
      <div>
        <Button asChild variant='ghost' className='mb-8 w-fit px-0 text-white hover:bg-white/10 hover:text-white'><Link href='/'><ArrowLeft className='h-4 w-4' />Back to FO home</Link></Button>
        <Badge variant='accent' className='mb-4 w-fit bg-white/14 text-white'>{blueprint.badgeLabel}</Badge>
        <h1 className='max-w-md text-4xl font-semibold leading-tight'>{blueprint.heroTitle}</h1>
        <p className='mt-4 max-w-md text-sm leading-7 text-white/78'>{blueprint.heroDescription}</p>
        <div className='mt-6 rounded-3xl border border-white/10 bg-white/7 p-4'>
          <p className='text-xs uppercase tracking-[0.2em] text-white/65'>Goal</p>
          <p className='mt-2 text-sm text-white/88'>{blueprint.goal}</p>
        </div>
      </div>

      <div className='mt-8 space-y-4'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-white/65'>Flow</p>
          <div className='mt-3 space-y-3'>
            {blueprint.flow.map(item => (
              <div key={item.step} className='rounded-2xl border border-white/10 bg-white/6 p-4'>
                <div className='flex items-start gap-3'>
                  <Badge variant='outline' className='border-white/20 bg-white/10 px-2 py-0.5 text-[10px] text-white'>{item.step}</Badge>
                  <div>
                    <p className='font-semibold text-white'>{item.title}</p>
                    <p className='mt-1 text-xs leading-relaxed text-white/78'>{item.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function AuthInsights({ mode }: { mode: AuthRouteMode }) {
  const blueprint = blueprintByMode[mode];

  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      <Card className='border-white/55 bg-white/72'>
        <CardHeader>
          <Badge variant='secondary' className='w-fit'>UI cần thiết</Badge>
          <CardTitle className='text-base'>UI checklist</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {blueprint.uiNeeds.map(item => <div key={item} className='rounded-2xl border bg-background/80 p-3 text-sm text-muted-foreground'>{item}</div>)}
        </CardContent>
      </Card>
      <Card className='border-white/55 bg-white/72'>
        <CardHeader>
          <Badge variant='secondary' className='w-fit'>API</Badge>
          <CardTitle className='text-base'>API lanes</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {blueprint.apiNeeds.map(item => <div key={item.title} className='rounded-2xl border bg-background/80 p-3 text-sm'><p className='font-medium'>{item.title}</p><p className='mt-1 text-muted-foreground'>{item.copy}</p></div>)}
        </CardContent>
      </Card>
      <Card className='border-white/55 bg-white/72'>
        <CardHeader>
          <Badge variant='secondary' className='w-fit'>Behavior</Badge>
          <CardTitle className='text-base'>Expected behavior</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {blueprint.behaviors.map(item => <div key={item.title} className='rounded-2xl border bg-background/80 p-3 text-sm'><p className='font-medium'>{item.title}</p><p className='mt-1 text-muted-foreground'>{item.copy}</p></div>)}
        </CardContent>
      </Card>
    </div>
  );
}

function AuthSurface({ title, description, icon, children }: Readonly<{ title: string; description: string; icon: React.ReactNode; children: React.ReactNode }>) {
  return (
    <Card className='overflow-hidden border-white/60 bg-white/78 shadow-[0_30px_80px_rgba(31,48,40,0.12)] backdrop-blur-xl'>
      <CardHeader className='border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,243,235,0.88))]'>
        <div className='flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] text-primary'>{icon}</div>
          <div>
            <CardTitle className='text-xl'>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-5 p-6'>{children}</CardContent>
    </Card>
  );
}

export function AuthPanel({ mode = 'combined' }: Readonly<{ mode?: AuthPanelMode }>) {
  const [session, setSession] = useState<LoginResponse | null>(null);
  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '' } });
  const registerForm = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { email: '', password: '', confirmPassword: '' } });
  const showLogin = mode === 'combined' || mode === 'login';
  const showRegister = mode === 'combined' || mode === 'register';
  const isStandalone = mode !== 'combined';
  const routeMode: AuthRouteMode = mode === 'register' ? 'register' : 'login';

  useEffect(() => {
    setSession(readAuthSession());
  }, []);

  async function handleLogin(values: LoginFormValues) {
    try {
      const response = await login(values);
      saveAuthSession(response);
      setSession(response);
      appToast.success('Welcome back. Your FO session is ready.');
      loginForm.reset({ identifier: '', password: '' });
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : 'Unable to login.');
    }
  }

  async function handleRegister(values: RegisterFormValues) {
    try {
      const response = await register(values);
      appToast.success(response.data?.message || response.message || 'Account created. You can now login.');
      registerForm.reset({ email: '', password: '', confirmPassword: '' });
      loginForm.setValue('identifier', values.email);
      loginForm.setFocus('password');
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : 'Unable to register.');
    }
  }

  function handleLogout() {
    clearAuthSession();
    setSession(null);
    appToast.info('FO session cleared.');
  }

  if (isStandalone) {
    return (
      <main className='relative page-shell overflow-hidden bg-[linear-gradient(180deg,#f7f3ec_0%,#f1ebdf_45%,#ece5d9_100%)]'>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,226,214,0.8),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(246,210,192,0.9),transparent_26%)]' />
        <div className='relative mx-auto  space-y-8'>
          <div className='grid gap-8 lg:grid-cols-[0.92fr_1.08fr]'>
            <AuthBlueprintRail mode={routeMode} />
            <div className='space-y-6'>
              {mode === 'login' ? (
                <motion.form initial={false} whileHover={{ y: -1 }} transition={{ duration: 0.2 }} onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <AuthSurface title='Login to continue' description='Dùng email/password để mở account hub và toàn bộ protected journeys.' icon={<LogIn className='h-5 w-5' />}>
                    <div className='grid gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='login-email'>Email</Label>
                        <Input id='login-email' autoComplete='email' {...loginForm.register('identifier')} placeholder='customer@example.com' />
                        <p className='text-xs text-destructive'>{loginForm.formState.errors.identifier?.message}</p>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='login-password'>Password</Label>
                        <Input id='login-password' type='password' autoComplete='current-password' {...loginForm.register('password')} placeholder='••••••••' />
                        <p className='text-xs text-destructive'>{loginForm.formState.errors.password?.message}</p>
                      </div>
                    </div>
                    <div className='flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground'>
                      <p>Recovery and register lanes stay available if user cannot continue here.</p>
                      <Link className='font-medium text-primary' href='/forgot-password'>Forgot password?</Link>
                    </div>
                    <Button type='submit' className='w-full' disabled={loginForm.formState.isSubmitting}>{loginForm.formState.isSubmitting ? 'Logging in...' : 'Login'}</Button>
                    <div className='rounded-2xl border border-border/70 bg-background/78 p-4 text-sm text-muted-foreground'>Success target: profile, dashboard, notifications, or the protected route in `next`.</div>
                    <p className='text-center text-sm text-muted-foreground'>No account yet? <Link className='font-medium text-primary' href='/register'>Create one now</Link>.</p>
                  </AuthSurface>
                </motion.form>
              ) : (
                <motion.form initial={false} whileHover={{ y: -1 }} transition={{ duration: 0.2 }} onSubmit={registerForm.handleSubmit(handleRegister)}>
                  <AuthSurface title='Create FO account' description='Tạo customer identity nhẹ để dùng lại cho profile, dashboard và notifications.' icon={<UserPlus className='h-5 w-5' />}>
                    <div className='grid gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='register-email'>Email</Label>
                        <Input id='register-email' autoComplete='email' {...registerForm.register('email')} placeholder='customer@example.com' />
                        <p className='text-xs text-destructive'>{registerForm.formState.errors.email?.message}</p>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='register-password'>Password</Label>
                        <Input id='register-password' type='password' autoComplete='new-password' {...registerForm.register('password')} placeholder='At least 6 characters' />
                        <p className='text-xs text-destructive'>{registerForm.formState.errors.password?.message}</p>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='register-confirm'>Confirm password</Label>
                        <Input id='register-confirm' type='password' autoComplete='new-password' {...registerForm.register('confirmPassword')} placeholder='Repeat password' />
                        <p className='text-xs text-destructive'>{registerForm.formState.errors.confirmPassword?.message}</p>
                      </div>
                    </div>
                    <div className='rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground'>Register should create one clean identity and avoid duplicate customer records.</div>
                    <Button type='submit' variant='secondary' className='w-full' disabled={registerForm.formState.isSubmitting}>{registerForm.formState.isSubmitting ? 'Creating account...' : 'Create account'}</Button>
                    <p className='text-center text-sm text-muted-foreground'>Already have an account? <Link className='font-medium text-primary' href='/login'>Login</Link>.</p>
                  </AuthSurface>
                </motion.form>
              )}
              <AuthInsights mode={routeMode} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <section className='mx-auto grid  gap-6 px-4 pb-4 pt-6 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-10'>
      <motion.div initial={false} whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
        <SessionCard session={session} onLogout={handleLogout} />
      </motion.div>

      <div className={`grid gap-6 ${showLogin && showRegister ? 'xl:grid-cols-2' : ''}`}>
        {showLogin ? (
          <motion.form initial={false} whileHover={{ y: -1 }} transition={{ duration: 0.2 }} onSubmit={loginForm.handleSubmit(handleLogin)}>
            <AuthSurface title='Login' description='Use FO auth to continue into protected customer routes.' icon={<LogIn className='h-5 w-5' />}>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='login-email'>Email</Label>
                  <Input id='login-email' autoComplete='email' {...loginForm.register('identifier')} placeholder='customer@example.com' />
                  <p className='text-xs text-destructive'>{loginForm.formState.errors.identifier?.message}</p>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='login-password'>Password</Label>
                  <Input id='login-password' type='password' autoComplete='current-password' {...loginForm.register('password')} placeholder='••••••••' />
                  <p className='text-xs text-destructive'>{loginForm.formState.errors.password?.message}</p>
                </div>
              </div>
              <div className='flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground'>
                <p>Need recovery instead?</p>
                <Link className='font-medium text-primary' href='/forgot-password'>Forgot password</Link>
              </div>
              <Button type='submit' className='w-full' disabled={loginForm.formState.isSubmitting}>{loginForm.formState.isSubmitting ? 'Logging in...' : 'Login'}</Button>
              <div className='grid gap-3'>
                <div className='rounded-2xl border border-border/70 bg-background/78 p-4 text-sm text-muted-foreground'>API lane: `POST /api/auth/login` → save session → hydrate profile/dashboard routes.</div>
                <div className='flex flex-wrap gap-2'><Button asChild size='sm' variant='outline'><Link href='/profile'>Profile</Link></Button><Button asChild size='sm' variant='outline'><Link href='/dashboard'>Dashboard</Link></Button></div>
              </div>
            </AuthSurface>
          </motion.form>
        ) : null}

        {showRegister ? (
          <motion.form initial={false} whileHover={{ y: -1 }} transition={{ duration: 0.2 }} onSubmit={registerForm.handleSubmit(handleRegister)}>
            <AuthSurface title='Register' description='Create one stable FO identity before starting longer journeys.' icon={<UserPlus className='h-5 w-5' />}>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='register-email'>Email</Label>
                  <Input id='register-email' autoComplete='email' {...registerForm.register('email')} placeholder='customer@example.com' />
                  <p className='text-xs text-destructive'>{registerForm.formState.errors.email?.message}</p>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='register-password'>Password</Label>
                  <Input id='register-password' type='password' autoComplete='new-password' {...registerForm.register('password')} placeholder='At least 6 characters' />
                  <p className='text-xs text-destructive'>{registerForm.formState.errors.password?.message}</p>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='register-confirm'>Confirm password</Label>
                  <Input id='register-confirm' type='password' autoComplete='new-password' {...registerForm.register('confirmPassword')} placeholder='Repeat password' />
                  <p className='text-xs text-destructive'>{registerForm.formState.errors.confirmPassword?.message}</p>
                </div>
              </div>
              <div className='rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground'>Register success should prefill login email and prevent duplicate account creation.</div>
              <Button type='submit' variant='secondary' className='w-full' disabled={registerForm.formState.isSubmitting}>{registerForm.formState.isSubmitting ? 'Creating account...' : 'Create account'}</Button>
              <p className='text-center text-sm text-muted-foreground'>Already have an account? <Link className='font-medium text-primary' href='/login'>Login</Link>.</p>
            </AuthSurface>
          </motion.form>
        ) : null}
      </div>
    </section>
  );
}
