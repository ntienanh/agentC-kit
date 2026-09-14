'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useSignInLogic } from '@/logic/auth/useSignInLogic';
import { useI18n } from '@/shared/i18n';
import { Alert, Button, Form, Input } from 'antd';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, ShieldCheck, Sparkles, User } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const { isPending, permissionsChanged, onFinish } = useSignInLogic();
  const t = useI18n('features.auth.signIn');

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className='w-full px-1 sm:px-4'
    >
      {permissionsChanged && (
        <Alert
          message={t('permissionsChangedWarning')}
          type='warning'
          showIcon
          className='mb-6 rounded-xl border-amber-500/20 bg-amber-500/10'
        />
      )}

      <div className='mb-7 flex flex-col gap-2'>
        <div className='border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1 text-[11px] font-semibold shadow-xs'>
          <Sparkles className='text-primary h-3 w-3 animate-pulse' />
          <span>SECURE ACCESS CONTROL</span>
        </div>
        <h1 className='text-heading text-2xl font-bold tracking-tight sm:text-3xl'>{t('pageTitle')}</h1>
        <p className='text-muted-foreground text-xs leading-relaxed sm:text-sm'>{t('subtitle')}</p>
      </div>

      <Form name='login' onFinish={onFinish} layout='vertical' requiredMark={false} colon={false} className='space-y-5'>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Form.Item
            name='username'
            label={
              <span className='metric-label text-muted-foreground mb-1.5 block text-[11px] font-bold tracking-widest uppercase'>
                {t('usernameLabel')}
              </span>
            }
            rules={[{ required: true, message: t('usernameRequired') }]}
            className='mb-0'
          >
            <Input
              size='large'
              prefix={
                <User className='text-muted-foreground/60 group-hover:text-primary mr-2 h-4 w-4 transition-colors' />
              }
              placeholder={t('usernamePlaceholder')}
              className='border-border/80 bg-surface-subtle/50 hover:border-primary! focus:border-primary! focus:ring-primary/20! focus:bg-card! hover:bg-card/80 h-12 rounded-xl text-sm shadow-xs transition-all duration-200'
            />
          </Form.Item>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Form.Item
            name='password'
            label={
              <span className='metric-label text-muted-foreground mb-1.5 block text-[11px] font-bold tracking-widest uppercase'>
                {t('passwordLabel')}
              </span>
            }
            rules={[{ required: true, message: t('passwordRequired') }]}
            className='mb-0'
          >
            <Input.Password
              id='login_password'
              size='large'
              prefix={<Lock className='text-muted-foreground/60 mr-2 h-4 w-4 transition-colors' />}
              placeholder={t('passwordPlaceholder')}
              className='border-border/80 bg-surface-subtle/50 hover:border-primary! focus-within:border-primary! focus-within:ring-primary/20! focus-within:bg-card! hover:bg-card/80 h-12 rounded-xl text-sm shadow-xs transition-all duration-200'
            />
          </Form.Item>
          <div className='mt-2 flex justify-end'>
            <Link
              href={APP_HREFS.FORGOT_PASSWORD}
              className='metric-label text-primary/80 hover:text-primary text-[11px] font-semibold tracking-wider uppercase transition-colors duration-200 hover:underline'
            >
              Forgot password?
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className='pt-3'
        >
          <Button
            type='primary'
            htmlType='submit'
            block
            loading={isPending}
            size='large'
            className='group from-primary shadow-primary/20 hover:shadow-primary/30 relative h-12 cursor-pointer overflow-hidden rounded-xl! border-none bg-gradient-to-r via-indigo-600 to-indigo-700 text-sm! font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-xl active:scale-[0.98]'
          >
            <span className='flex items-center justify-center gap-2'>
              <span>{t('signInButton')}</span>
              <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
            </span>
          </Button>
        </motion.div>

        <div className='pt-2 text-center'>
          <div className='text-muted-foreground/70 inline-flex items-center justify-center gap-1.5 text-[11px] font-medium'>
            <ShieldCheck className='h-3.5 w-3.5 text-emerald-500' />
            <span>Protected by Role-Based Access Control (RBAC)</span>
          </div>
        </div>
      </Form>
    </motion.section>
  );
}
