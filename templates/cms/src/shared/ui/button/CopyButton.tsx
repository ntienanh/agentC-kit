'use client';

import { useAntdMessage } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { CopyOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import type { SyntheticEvent } from 'react';

interface CopyButtonProps {
  value: string;
  displayValue?: string;
  size?: 'small' | 'middle' | 'large';
}

export const CopyButton = ({ value, displayValue, size = 'small' }: CopyButtonProps) => {
  const message = useAntdMessage();
  const tError = useI18n('error');
  const tCommon = useI18n('common');
  const handleCopy = async (event?: SyntheticEvent<HTMLElement>) => {
    event?.preventDefault();
    event?.stopPropagation();

    try {
      await navigator.clipboard.writeText(value);
      message.success(tCommon('copiedToClipboard'));
    } catch {
      message.error(tError('COPY_FAILED'));
    }
  };

  return (
    <div
      aria-label={tCommon('copy')}
      className='border-border hover:bg-muted/30 hover:border-primary/50 focus-visible:ring-primary group flex cursor-pointer items-center justify-between gap-2 rounded-md! border px-2.5! py-1! text-xs transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none'
      onClick={handleCopy}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          void handleCopy(e);
        }
      }}
    >
      <div className='group-hover:text-primary truncate underline decoration-dotted transition-colors'>
        {displayValue ?? value}
      </div>
      <Tooltip title={tCommon('copy')}>
        <Button
          aria-label={tCommon('copy')}
          type='text'
          size={size}
          icon={<CopyOutlined />}
          onClick={handleCopy}
          className='group-hover:text-primary!'
        />
      </Tooltip>
    </div>
  );
};
