import { apiFetch } from "@/lib/apiFetch";

import { NextResponse } from 'next/server';
import { withRecoveryContinuityMeta } from '@/features/auth/recovery-contract';
import { forgotPasswordSchema } from '@/features/auth/schema';
import { withApiLogging } from '@/shared/lib/http';

function getBackendBaseUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
}

export const POST = withApiLogging('/api/auth/forgot-password', async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { message: parsed.error.issues[0]?.message || 'Invalid forgot-password payload.' } }, { status: 400 });
    const upstream = await apiFetch(`${getBackendBaseUrl()}/api/v1/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data), cache: 'no-store' });
    const data = await upstream.json().catch(() => null);
    return NextResponse.json(withRecoveryContinuityMeta(data, { step: 'forgot-password', email: parsed.data.email, requestId: request.headers.get('x-request-id') }), { status: upstream.status });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof Error ? error.message : 'Unexpected forgot-password error.' } }, { status: 500 });
  }
});
