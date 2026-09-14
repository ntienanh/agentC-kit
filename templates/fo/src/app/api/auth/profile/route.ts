import { apiFetch } from "@/lib/apiFetch";

import { NextResponse } from 'next/server';
import { profileSchema } from '@/features/auth/schema';
import { withApiLogging } from '@/shared/lib/http';

function getBackendBaseUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
}

function getAuthHeader(request: Request) {
  const auth = request.headers.get('authorization');
  if (!auth) throw new Error('Missing Authorization header.');
  return auth;
}

export const GET = withApiLogging('/api/auth/profile', async (request: Request) => {
  try {
    let authHeader: string;
    try {
      authHeader = getAuthHeader(request);
    } catch {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing Authorization header.' } },
        { status: 401 },
      );
    }

    const upstream = await apiFetch(`${getBackendBaseUrl()}/api/v1/auth/profile`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    const data = await upstream.json().catch(() => null);
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    const isFetchFailed =
      (error instanceof TypeError && error.message.includes('fetch failed')) ||
      (error as { code?: string })?.code === 'ECONNREFUSED';
    const status = isFetchFailed ? 503 : 500;
    const code = isFetchFailed ? 'UPSTREAM_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR';
    const message = isFetchFailed
      ? 'Backend upstream service is currently unavailable.'
      : error instanceof Error
        ? error.message
        : 'Unexpected profile error.';
    return NextResponse.json({ error: { code, message } }, { status });
  }
});

export const PUT = withApiLogging('/api/auth/profile', async (request: Request) => {
  try {
    let authHeader: string;
    try {
      authHeader = getAuthHeader(request);
    } catch {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing Authorization header.' } },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid profile payload.' } },
        { status: 400 },
      );
    }

    const upstream = await apiFetch(`${getBackendBaseUrl()}/api/v1/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
    const data = await upstream.json().catch(() => null);
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    const isFetchFailed =
      (error instanceof TypeError && error.message.includes('fetch failed')) ||
      (error as { code?: string })?.code === 'ECONNREFUSED';
    const status = isFetchFailed ? 503 : 500;
    const code = isFetchFailed ? 'UPSTREAM_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR';
    const message = isFetchFailed
      ? 'Backend upstream service is currently unavailable.'
      : error instanceof Error
        ? error.message
        : 'Unexpected profile update error.';
    return NextResponse.json({ error: { code, message } }, { status });
  }
});
