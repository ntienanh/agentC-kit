import { COOKIE_CONFIG } from '@/configs/app/auth/auth-flow.config';
import { ACCESS_TOKEN, ID_TOKEN, REFRESH_TOKEN } from '@/configs/core/session.config';
import { TokenResponse, createCookieOptions, isSecureEnvironment } from '@/shared/lib/cookies.util';
import { cookies as serverCookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function setAuthCookiesOnServer(tokens: TokenResponse): Promise<void> {
  const isSecure = isSecureEnvironment();
  const cookieStore = await serverCookies();

  cookieStore.set(ACCESS_TOKEN, tokens.accessToken, createCookieOptions(isSecure));
  cookieStore.set(REFRESH_TOKEN, tokens.refreshToken, createCookieOptions(isSecure));

  if (tokens.idToken) {
    cookieStore.set(ID_TOKEN, tokens.idToken, createCookieOptions(isSecure));
  }
}

export function setAuthCookies(res: NextResponse, tokens: TokenResponse, isSecure: boolean): void {
  const accessTokenOptions = createCookieOptions(isSecure, tokens.expiresIn || COOKIE_CONFIG.MAX_AGE.ACCESS_TOKEN);

  const refreshTokenOptions = createCookieOptions(
    isSecure,
    tokens.refreshExpiresIn || COOKIE_CONFIG.MAX_AGE.REFRESH_TOKEN,
  );

  res.cookies.set(ACCESS_TOKEN, tokens.accessToken, accessTokenOptions);
  res.cookies.set(REFRESH_TOKEN, tokens.refreshToken, refreshTokenOptions);

  if (tokens.idToken) {
    res.cookies.set(ID_TOKEN, tokens.idToken, accessTokenOptions);
  }
}

export function clearAuthCookies(res: NextResponse, isSecure: boolean): void {
  const clearOptions = createCookieOptions(
    isSecure,
    undefined,
    new Date(0),
  );

  res.cookies.set(ACCESS_TOKEN, '', clearOptions);
  res.cookies.set(REFRESH_TOKEN, '', clearOptions);
  res.cookies.set(ID_TOKEN, '', clearOptions);
}

export const cookieStorageServer = {
  get: async (key: string): Promise<string | undefined> => {
    const cookieStore = await serverCookies();
    return cookieStore.get(key)?.value;
  },
};
