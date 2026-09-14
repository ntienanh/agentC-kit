import { describe, expect, it } from 'vitest';
import { assertMutationResponse } from './useMutationFeedback';

describe('assertMutationResponse', () => {
  it('allows successful mutation responses', async () => {
    await expect(assertMutationResponse(new Response(null, { status: 204 }), 'Fallback')).resolves.toBeUndefined();
  });

  it('uses API message when mutation fails', async () => {
    const response = new Response(JSON.stringify({ message: 'Conflict detected' }), { status: 409 });

    await expect(assertMutationResponse(response, 'Fallback')).rejects.toThrow('Conflict detected');
  });

  it('falls back when error payload is not available', async () => {
    const response = new Response('not-json', { status: 500 });

    await expect(assertMutationResponse(response, 'Fallback')).rejects.toThrow('Fallback');
  });
});
