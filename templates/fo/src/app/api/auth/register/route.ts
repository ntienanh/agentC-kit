import { apiFetch } from "@/lib/apiFetch";

import { NextResponse } from 'next/server';
import { mapRegisterPayload } from '@/features/auth/api';
import { registerSchema } from '@/features/auth/schema';
import { withApiLogging } from '@/shared/lib/http';

function getBackendBaseUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
}

function withRegisterContinuityMeta(payload: unknown, identifier: string) {
  const base = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  return {
    ...base,
    meta: {
      ...(base.meta && typeof base.meta === 'object' ? base.meta as Record<string, unknown> : {}),
      continuity: {
        scope: 'fo-auth-register',
        identifier,
        downstream: ['verify-email', 'login', 'profile'],
      },
    },
  };
}

export const POST = withApiLogging('/api/auth/register', async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: { message: parsed.error.issues[0]?.message || 'Invalid register payload.' } }, { status: 400 });
    }

    const response = await apiFetch(`${getBackendBaseUrl()}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapRegisterPayload(parsed.data)),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(withRegisterContinuityMeta(data, parsed.data.email), { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof Error ? error.message : 'Unexpected register error.' } }, { status: 500 });
  }
});
