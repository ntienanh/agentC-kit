import { SESSION_TIMING } from '@/configs/core/session.config';
import { apiFetch } from '@/shared/lib/apiFetch';
import { getCmsOriginUrl } from '@/shared/lib/http';

const AUTH_BASE = getCmsOriginUrl();
const REFRESH_ENDPOINT = '/auth/refresh-token';

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

let inflightRefresh: Promise<RefreshResult | null> | null = null;

async function doRefresh(token: string): Promise<RefreshResult | null> {
  try {
    const res = await apiFetch(`${AUTH_BASE}${REFRESH_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = json.data ?? json;

    const accessToken = data.access_token ?? data.accessToken ?? data.jwt;
    const refreshToken = data.refresh_token ?? data.refreshToken;
    const expiresIn = data.expires_in ?? data.expiresIn ?? SESSION_TIMING.DEFAULT_EXPIRES_IN_SEC;

    if (!accessToken || !refreshToken) return null;

    return { accessToken, refreshToken, expiresIn };
  } catch {
    return null;
  }
}

export async function refreshTokenWithLock(token: string): Promise<RefreshResult | null> {
  if (inflightRefresh !== null) {
    return inflightRefresh;
  }

  inflightRefresh = doRefresh(token).finally(() => {
    inflightRefresh = null;
  });

  return inflightRefresh;
}
