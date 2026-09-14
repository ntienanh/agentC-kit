'use client';

import { Button, Result } from 'antd';

export default function ProtectedError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <div className='flex h-[calc(100vh-5rem)] w-full items-center justify-center'>
      <Result
        status='error'
        title='Something went wrong'
        subTitle={error.message}
        extra={
          <Button type='primary' onClick={reset}>
            Try Again
          </Button>
        }
      />
    </div>
  );
}
