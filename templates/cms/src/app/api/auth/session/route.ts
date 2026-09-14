import { ACCESS_TOKEN, REFRESH_TOKEN, SESSION_TIMING } from '@/configs/core/session.config';
import { clearAuthCookies, setAuthCookies } from '@/shared/lib/cookies.server';
import { isSecureEnvironment } from '@/shared/lib/cookies.util';
import { refreshTokenWithLock } from '@/shared/lib/refresh-lock.server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return typeof payload.exp === 'number' ? payload.exp * SESSION_TIMING.ONE_SECOND_MS : null;
  } catch {
    return null;
  }
}

function createUnauthorizedSessionResponse(
  code: 'SESSION_MISSING' | 'SESSION_REFRESH_FAILED',
  message: string,
  shouldClearCookies = false,
) {
  const response = NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status: 401 },
  );

  if (shouldClearCookies) {
    clearAuthCookies(response, isSecureEnvironment());
  }

  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN)?.value;

  if (accessToken) {
    const exp = getJwtExp(accessToken);
    if (exp && exp > Date.now()) {
      return NextResponse.json({
        accessToken,
        expiresIn: Math.floor((exp - Date.now()) / SESSION_TIMING.ONE_SECOND_MS),
      });
    }
    if (accessToken.startsWith('mock-') || process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        accessToken,
        expiresIn: 3600,
      });
    }
  }

  if (refreshToken) {
    const tokens = await refreshTokenWithLock(refreshToken);

    if (tokens) {
      const response = NextResponse.json({
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      });

      setAuthCookies(
        response,
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
        isSecureEnvironment(),
      );

      return response;
    }

    return createUnauthorizedSessionResponse(
      'SESSION_REFRESH_FAILED',
      'Session refresh failed. Please sign in again.',
      true,
    );
  }

  return createUnauthorizedSessionResponse(
    'SESSION_MISSING',
    'No valid session. Please sign in again.',
    Boolean(accessToken),
  );
}
