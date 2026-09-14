import { COOKIE_CONFIG } from '@/configs/app/auth/auth-flow.config';
import Cookies from 'js-cookie';

interface CookieOptions {
  path: string;
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  secure: boolean;
  maxAge?: number;
  expires?: Date;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
  tokenType?: string;
  scope?: string;
}

export function createCookieOptions(isSecure: boolean, maxAge?: number, expires?: Date): CookieOptions {
  return {
    path: COOKIE_CONFIG.PATH,
    httpOnly: COOKIE_CONFIG.HTTP_ONLY,
    sameSite: COOKIE_CONFIG.SAME_SITE,
    secure: isSecure,
    ...(maxAge && { maxAge }),
    ...(expires && { expires }),
  };
}

export const cookieStorage = {
  get: (key: string): string | undefined => {
    if (isServer) {
      return undefined;
    }
    return Cookies.get(key);
  },

  set: (key: string, value: string, days = 365) => {
    if (isServer) {
      return;
    }
    Cookies.set(key, value, { expires: days, path: '/' });
  },

  remove: (key: string) => {
    if (isServer) {
      return;
    }
    Cookies.remove(key, { path: '/' });
  },
};

export function isSecureEnvironment(): boolean {
  return process.env.APP_ENV === 'production';
}

export const isServer = globalThis.window === undefined;
