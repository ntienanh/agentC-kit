'use client';

import type { EnhancedError, ErrorCategory, ErrorSeverity } from '@/shared/lib/error/types';
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

interface ErrorContextValue {
  errors: EnhancedError[];
  addError: (error: EnhancedError) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  markErrorHandled: (errorId: string) => void;
  getErrorsByCategory: (category: ErrorCategory) => EnhancedError[];
  getErrorsBySeverity: (severity: ErrorSeverity) => EnhancedError[];
  getUnhandledErrors: () => EnhancedError[];
  hasErrors: boolean;
  errorCount: number;
}

export const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

const MAX_ERRORS = 50;
const ERROR_DEDUPLICATION_WINDOW = 5000;

interface ErrorContextProviderProps {
  children: ReactNode;
}

export function ErrorContextProvider({ children }: ErrorContextProviderProps) {
  const [errors, setErrors] = useState<EnhancedError[]>([]);

  const addError = useCallback((error: EnhancedError) => {
    setErrors(prevErrors => {
      const isDuplicate = prevErrors.some(
        e =>
          e.message === error.message &&
          e.category === error.category &&
          Date.now() - e.timestamp.getTime() < ERROR_DEDUPLICATION_WINDOW,
      );

      if (isDuplicate) {
        return prevErrors;
      }

      return [error, ...prevErrors].slice(0, MAX_ERRORS);
    });
  }, []);

  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const markErrorHandled = useCallback((errorId: string) => {
    setErrors(prev => prev.map(e => (e.id === errorId ? { ...e, handled: true } : e)));
  }, []);

  const getErrorsByCategory = useCallback(
    (category: ErrorCategory) => errors.filter(e => e.category === category),
    [errors],
  );

  const getErrorsBySeverity = useCallback(
    (severity: ErrorSeverity) => errors.filter(e => e.severity === severity),
    [errors],
  );

  const getUnhandledErrors = useCallback(() => errors.filter(e => !e.handled), [errors]);

  const value = useMemo(
    () => ({
      errors,
      addError,
      removeError,
      clearErrors,
      markErrorHandled,
      getErrorsByCategory,
      getErrorsBySeverity,
      getUnhandledErrors,
      hasErrors: errors.length > 0,
      errorCount: errors.length,
    }),
    [
      errors,
      addError,
      removeError,
      clearErrors,
      markErrorHandled,
      getErrorsByCategory,
      getErrorsBySeverity,
      getUnhandledErrors,
    ],
  );

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}
