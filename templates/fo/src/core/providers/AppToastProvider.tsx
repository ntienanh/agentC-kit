'use client';

import { ToastContainer } from 'react-toastify';

export function AppToastProvider() {
  return (
    <ToastContainer
      position='top-right'
      autoClose={3200}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme='light'
      className='text-sm'
    />
  );
}
