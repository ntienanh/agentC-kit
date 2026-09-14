'use client';

import { useContext } from 'react';
import { ErrorContext } from './ErrorContext';

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorContextProvider');
  }
  return context;
}

export function useErrorCount() {
  const { errorCount } = useError();
  return errorCount;
}

export function useHasErrors() {
  const { hasErrors } = useError();
  return hasErrors;
}

export function useUnhandledErrors() {
  const { getUnhandledErrors } = useError();
  return getUnhandledErrors();
}
