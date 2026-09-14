'use client';

import { useCallback, useRef, useState } from 'react';

export class DoubleSubmitLock {
  private isLocked = false;

  public async execute<Args extends unknown[], Result>(
    fn: (...args: Args) => Promise<Result>,
    ...args: Args
  ): Promise<Result | undefined> {
    if (this.isLocked) {
      return undefined;
    }
    this.isLocked = true;
    try {
      return await fn(...args);
    } finally {
      this.isLocked = false;
    }
  }

  public get locked(): boolean {
    return this.isLocked;
  }
}

export function usePreventDoubleSubmit<Args extends unknown[], Result>(
  submitFn: (...args: Args) => Promise<Result>,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lockRef = useRef(new DoubleSubmitLock());

  const handleSubmit = useCallback(
    async (...args: Args): Promise<Result | undefined> => {
      if (lockRef.current.locked) return undefined;
      setIsSubmitting(true);
      try {
        return await lockRef.current.execute(submitFn, ...args);
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitFn],
  );

  return {
    isSubmitting,
    handleSubmit,
  };
}
