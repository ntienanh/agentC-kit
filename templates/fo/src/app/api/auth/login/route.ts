import { apiFetch } from "@/lib/apiFetch";

import { NextResponse } from 'next/server';
import { mapLoginPayload } from '@/features/auth/api';
import { loginSchema } from '@/features/auth/schema';
import { withApiLogging } from '@/shared/lib/http';

function getBackendBaseUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
}

function withLoginContinuityMeta(payload: unknown, email: string) {
  const base = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  return {
    ...base,
    meta: {
      ...(base.meta && typeof base.meta === 'object' ? base.meta as Record<string, unknown> : {}),
      continuity: {
        scope: 'fo-auth-login',
        email,
        downstream: ['profile'],
      },
    },
  };
}

export const POST = withApiLogging('/api/auth/login', async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: { message: parsed.error.issues[0]?.message || 'Invalid login payload.' } }, { status: 400 });
    }

    const payload = mapLoginPayload(parsed.data) as Record<string, string>;
    const response = await apiFetch(`${getBackendBaseUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: payload.email || payload.identifier,
        password: payload.password,
      }),
      cache: 'no-store',
    });

    const rawData = await response.json().catch(() => null);
    const sessionData = (rawData?.data ?? rawData) as Record<string, unknown> | null;
    const token = (sessionData?.accessToken || sessionData?.token || sessionData?.jwt) as string | undefined;
    const refreshToken = sessionData?.refreshToken as string | undefined;
    const user = sessionData?.user;

    const normalizedData = {
      ...(rawData && typeof rawData === 'object' ? rawData : {}),
      accessToken: token,
      jwt: token,
      refreshToken,
      user,
    };

    const nextResponse = NextResponse.json(withLoginContinuityMeta(normalizedData, parsed.data.identifier), { status: response.status });

    if (response.ok && token) {
      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
      };
      nextResponse.cookies.set('access_token', token, { ...cookieOpts, maxAge: 86400 });
      nextResponse.cookies.set('auth_token', token, { ...cookieOpts, maxAge: 86400 });
      if (refreshToken) {
        nextResponse.cookies.set('refresh_token', refreshToken, { ...cookieOpts, maxAge: 7 * 86400 });
      }
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof Error ? error.message : 'Unexpected login error.' } }, { status: 500 });
  }
});
