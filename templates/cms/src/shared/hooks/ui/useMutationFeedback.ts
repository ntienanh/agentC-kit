'use client';

import { useCallback } from 'react';
import { useAntdMessage } from './useAntdMessage';

type MutationFeedbackMessages = {
  success: string;
  error: string;
};

export async function assertMutationResponse(response: Response, fallbackMessage: string) {
  if (response.ok) return;

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  let msg = fallbackMessage;
  if (payload) {
    if (typeof payload.message === 'string') {
      msg = payload.message;
    } else if (Array.isArray(payload.message)) {
      msg = payload.message.join(' · ');
    } else if (typeof payload.error === 'string') {
      msg = payload.error;
    } else if (typeof payload.error === 'object' && payload.error !== null) {
      const errObj = payload.error as Record<string, unknown>;
      if (errObj.message) {
        msg = Array.isArray(errObj.message) ? errObj.message.join(' · ') : String(errObj.message);
      }
    }
  }
  throw new Error(msg);
}

export function useMutationFeedback() {
  const message = useAntdMessage();

  return useCallback(
    async <Result>(operation: () => Promise<Result>, messages: MutationFeedbackMessages) => {
      try {
        const result = await operation();
        message.success(messages.success);
        return result;
      } catch (error) {
        message.error(error instanceof Error ? error.message : messages.error);
        throw error;
      }
    },
    [message],
  );
}
