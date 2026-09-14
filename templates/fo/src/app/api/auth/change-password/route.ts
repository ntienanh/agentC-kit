import { apiFetch } from "@/lib/apiFetch";

import { NextResponse } from 'next/server';
import { withRecoveryContinuityMeta } from '@/features/auth/recovery-contract';
import { changePasswordSchema } from '@/features/auth/schema';
import { withApiLogging } from '@/shared/lib/http';

function getBackendBaseUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
}

function getAuthHeader(request: Request) {
  const auth = request.headers.get('authorization');
  if (!auth) throw new Error('Missing Authorization header.');
  return auth;
}

export const POST = withApiLogging('/api/auth/change-password', async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: parsed.error.issues[0]?.message || 'Invalid password change payload.' } }, { status: 400 });
    }

    const upstream = await apiFetch(`${getBackendBaseUrl()}/api/v1/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader(request) },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
    const data = await upstream.json().catch(() => null);
    return NextResponse.json(withRecoveryContinuityMeta(data, { step: 'change-password', requestId: request.headers.get('x-request-id'), authenticated: true }), { status: upstream.status });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof Error ? error.message : 'Unexpected password change error.' } }, { status: 500 });
  }
});
