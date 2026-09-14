'use client';

import { Spin } from 'antd';

export default function ProtectedLoading() {
  return (
    <div className='flex h-[calc(100vh-5rem)] w-full items-center justify-center'>
      <Spin size='large' />
    </div>
  );
}
