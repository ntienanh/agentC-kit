'use client';

import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/utils/cn.util';
import { CheckCircle2, Circle } from 'lucide-react';
import { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  readonly password?: string;
}

export function PasswordStrengthIndicator({ password = '' }: PasswordStrengthIndicatorProps) {
  const t = useI18n('features.auth.resetPassword');

  const criteria = useMemo(
    () => [
      {
        id: 'length',
        label: t('passwordLength'),
        isValid: password.length >= 8,
      },
      {
        id: 'uppercase',
        label: t('passwordUppercase'),
        isValid: /[A-Z]/.test(password),
      },
      {
        id: 'lowercase',
        label: t('passwordLowercase'),
        isValid: /[a-z]/.test(password),
      },
      {
        id: 'number',
        label: t('passwordNumber'),
        isValid: /\d/.test(password),
      },
    ],
    [password, t],
  );

  return (
    <div className='bg-muted/30 mb-6 flex flex-col gap-2 rounded-lg p-3 text-sm'>
      {criteria.map(c => (
        <div key={c.id} className='flex items-center gap-2'>
          {c.isValid ? (
            <CheckCircle2 className='text-success h-4 w-4' />
          ) : (
            <Circle className='text-muted-foreground h-4 w-4' />
          )}
          <span className={cn('transition-colors', c.isValid ? 'text-success' : 'text-muted-foreground')}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
