import { apiFetch } from "@/lib/apiFetch";

import { NextResponse } from 'next/server';
import { verifyEmailSchema } from '@/features/auth/schema';
import { withApiLogging } from '@/shared/lib/http';

function getBackendBaseUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
}

function withVerifyEmailContinuityMeta(payload: unknown) {
  const base = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  return {
    ...base,
    meta: {
      ...(base.meta && typeof base.meta === 'object' ? base.meta as Record<string, unknown> : {}),
      continuity: {
        scope: 'fo-auth-verify-email',
        downstream: ['login', 'profile'],
      },
    },
  };
}

export const POST = withApiLogging('/api/auth/verify-email', async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { message: parsed.error.issues[0]?.message || 'Invalid verify-email payload.' } }, { status: 400 });
    const upstream = await apiFetch(`${getBackendBaseUrl()}/api/v1/auth/verify-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data), cache: 'no-store' });
    const data = await upstream.json().catch(() => null);
    return NextResponse.json(withVerifyEmailContinuityMeta(data), { status: upstream.status });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof Error ? error.message : 'Unexpected verify-email error.' } }, { status: 500 });
  }
});
