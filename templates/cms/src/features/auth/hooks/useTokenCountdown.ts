'use client';

import { ACCESS_TOKEN, REFRESH_TOKEN, SESSION_TIMING } from '@/configs/core/session.config';
import { cookieStorage } from '@/shared/lib/cookies.util';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TokenInfo {
  remaining: number;
  total: number;
  isExpired: boolean;
  expiresAt: Date | null;
  issuedAt: Date | null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function getTokenInfo(token: string | undefined): TokenInfo {
  const empty: TokenInfo = { remaining: 0, total: 0, isExpired: true, expiresAt: null, issuedAt: null };
  if (!token) return empty;

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return empty;

  const exp = (payload.exp as number) * SESSION_TIMING.ONE_SECOND_MS;
  const iat =
    typeof payload.iat === 'number'
      ? (payload.iat as number) * SESSION_TIMING.ONE_SECOND_MS
      : exp - SESSION_TIMING.FALLBACK_ISSUED_AT_WINDOW_MS;
  const now = Date.now();
  const remaining = Math.max(0, exp - now);
  const total = exp - iat;

  return {
    remaining,
    total: total > 0 ? total : remaining,
    isExpired: remaining <= 0,
    expiresAt: new Date(exp),
    issuedAt: new Date(iat),
  };
}

export function useTokenCountdown() {
  const [accessInfo, setAccessInfo] = useState<TokenInfo>(() => getTokenInfo(cookieStorage.get(ACCESS_TOKEN)));
  const [refreshInfo, setRefreshInfo] = useState<TokenInfo>(() => getTokenInfo(cookieStorage.get(REFRESH_TOKEN)));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const update = useCallback(() => {
    const accessToken = cookieStorage.get(ACCESS_TOKEN);
    const refreshToken = cookieStorage.get(REFRESH_TOKEN);
    setAccessInfo(getTokenInfo(accessToken));
    setRefreshInfo(getTokenInfo(refreshToken));
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(update, SESSION_TIMING.ONE_SECOND_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [update]);

  return { accessToken: accessInfo, refreshToken: refreshInfo };
}
