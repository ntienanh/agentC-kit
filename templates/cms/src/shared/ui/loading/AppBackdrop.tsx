'use client';

import { Spin } from 'antd';
import { LoaderCircle } from 'lucide-react';

export interface AppBackdropProps {
  delay?: number;
  loading?: boolean;
}

export function AppBackdrop({ delay = 200, loading }: AppBackdropProps) {
  return (
    <Spin
      delay={delay}
      fullscreen
      spinning={loading}
      indicator={<LoaderCircle className='text-primary-foreground h-5 w-5 animate-spin' />}
      size='large'
    />
  );
}
