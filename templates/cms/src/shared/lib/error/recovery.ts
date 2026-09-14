
import { logError } from './logger';
import type { EnhancedError, ErrorCategory, ErrorRecoveryStrategy } from './types';
import { ErrorCategory as Category } from './types';
import { sleep } from './utils';

interface RetryState {
  attempt: number;
  lastAttemptTime: number;
  errorKey: string;
}

const retryStates = new Map<string, RetryState>();

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

const circuitBreakers = new Map<string, CircuitBreakerState>();

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000;

export const defaultRetryStrategies: Record<ErrorCategory, ErrorRecoveryStrategy> = {
  [Category.NETWORK]: {
    shouldAttemptRecovery: true,
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
  },
  [Category.API]: {
    shouldAttemptRecovery: true,
    maxRetries: 2,
    retryDelay: 1000,
    backoffMultiplier: 1,
  },
  [Category.SERVER]: {
    shouldAttemptRecovery: true,
    maxRetries: 2,
    retryDelay: 2000,
    backoffMultiplier: 2,
  },
  [Category.AUTHENTICATION]: {
    shouldAttemptRecovery: true,
    maxRetries: 1,
    retryDelay: 0,
    backoffMultiplier: 1,
  },
  [Category.AUTHORIZATION]: {
    shouldAttemptRecovery: false,
  },
  [Category.VALIDATION]: {
    shouldAttemptRecovery: false,
  },
  [Category.BUSINESS_LOGIC]: {
    shouldAttemptRecovery: false,
  },
  [Category.CLIENT]: {
    shouldAttemptRecovery: false,
  },
  [Category.UNKNOWN]: {
    shouldAttemptRecovery: true,
    maxRetries: 1,
    retryDelay: 1000,
    backoffMultiplier: 1,
  },
};

export function getRetryStrategy(error: EnhancedError): ErrorRecoveryStrategy {
  return {
    ...defaultRetryStrategies[error.category],
    ...error.recovery,
  };
}

export function shouldRetry(error: EnhancedError): boolean {
  const strategy = getRetryStrategy(error);

  if (!strategy.shouldAttemptRecovery) {
    return false;
  }

  if (isCircuitBreakerOpen(error)) {
    return false;
  }

  const errorKey = generateErrorKey(error);
  const state = retryStates.get(errorKey);

  if (!state) {
    return true;
  }

  return state.attempt < (strategy.maxRetries || 0);
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  error: EnhancedError,
  onRetry?: (attempt: number, maxRetries: number) => void,
): Promise<T> {
  const strategy = getRetryStrategy(error);

  if (!strategy.shouldAttemptRecovery) {
    throw error;
  }

  const errorKey = generateErrorKey(error);
  const maxRetries = strategy.maxRetries || 0;
  const baseDelay = strategy.retryDelay || 1000;
  const multiplier = strategy.backoffMultiplier || 1;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      updateRetryState(errorKey, attempt);

      const result = await operation();

      resetCircuitBreaker(error);

      return result;
    } catch (err) {
      lastError = err as Error;

      if (attempt === maxRetries) {
        break;
      }

      if (!shouldRetryError(err)) {
        throw err;
      }

      const delay = baseDelay * Math.pow(multiplier, attempt);

      onRetry?.(attempt + 1, maxRetries);

      await logError(error, {
        retryAttempt: attempt + 1,
        maxRetries,
        nextRetryDelay: delay,
      });

      await sleep(delay);
    }
  }

  recordCircuitBreakerFailure(error);

  throw lastError || error;
}

export function isCircuitBreakerOpen(error: EnhancedError): boolean {
  const key = generateCircuitBreakerKey(error);
  const state = circuitBreakers.get(key);

  if (!state) return false;

  if (state.state === 'OPEN') {
    if (Date.now() - state.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
      state.state = 'HALF_OPEN';
      state.failures = 0;
      return false;
    }
    return true;
  }

  return false;
}

export function recordCircuitBreakerFailure(error: EnhancedError): void {
  const key = generateCircuitBreakerKey(error);
  const state = circuitBreakers.get(key) || {
    failures: 0,
    lastFailureTime: 0,
    state: 'CLOSED' as const,
  };

  state.failures++;
  state.lastFailureTime = Date.now();

  if (state.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    state.state = 'OPEN';
  }

  circuitBreakers.set(key, state);
}

export function resetCircuitBreaker(error: EnhancedError): void {
  const key = generateCircuitBreakerKey(error);
  circuitBreakers.delete(key);
}

export function resetAllCircuitBreakers(): void {
  circuitBreakers.clear();
}

export function getCircuitBreakerStatus(): Array<{
  key: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
}> {
  return Array.from(circuitBreakers.entries()).map(([key, state]) => ({
    key,
    state: state.state,
    failures: state.failures,
  }));
}

function generateErrorKey(error: EnhancedError): string {
  return `${error.category}-${error.type}-${error.code}`;
}

function generateCircuitBreakerKey(error: EnhancedError): string {
  return error.context?.action || error.category;
}

function updateRetryState(errorKey: string, attempt: number): void {
  retryStates.set(errorKey, {
    attempt,
    lastAttemptTime: Date.now(),
    errorKey,
  });
}

function shouldRetryError(error: unknown): boolean {
  if (error instanceof Response) {
    if (error.status >= 400 && error.status < 500) {
      return error.status === 408 || error.status === 429;
    }
    return error.status >= 500;
  }

  if (error instanceof TypeError) {
    return true;
  }

  return false;
}

export function cleanupRetryStates(maxAge: number = 300000): void {
  const now = Date.now();
  for (const [key, state] of retryStates.entries()) {
    if (now - state.lastAttemptTime > maxAge) {
      retryStates.delete(key);
    }
  }
}
