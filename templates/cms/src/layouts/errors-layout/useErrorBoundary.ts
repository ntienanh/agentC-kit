'use client';

import { useState } from 'react';

export function useErrorBoundary(): (error: unknown) => void {
  const [error, setError] = useState<unknown>(null);

  if (error) {
    throw error;
  }

  return setError;
}
