import { COOKIE_CONFIG } from '@/configs/app/auth/auth-flow.config';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/configs/core/session.config';
import type { NextRequest } from 'next/server';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge: number;
}

export class CookieManager {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private createCookieOptions(maxAge: number): CookieOptions {
    return {
      httpOnly: COOKIE_CONFIG.HTTP_ONLY,
      secure: this.isProduction ? COOKIE_CONFIG.SECURE : false,
      sameSite: COOKIE_CONFIG.SAME_SITE,
      path: COOKIE_CONFIG.PATH,
      maxAge,
    };
  }

  private formatCookie(name: string, value: string, options: CookieOptions): string {
    const parts = [`${name}=${value}`];

    if (options.maxAge) {
      parts.push(`Max-Age=${options.maxAge}`);
    }

    if (options.path) {
      parts.push(`Path=${options.path}`);
    }

    if (options.httpOnly) {
      parts.push('HttpOnly');
    }

    if (options.secure) {
      parts.push('Secure');
    }

    if (options.sameSite) {
      parts.push(`SameSite=${options.sameSite}`);
    }

    return parts.join('; ');
  }

  setAuthCookies(accessToken: string, refreshToken: string): string[] {
    const accessTokenOptions = this.createCookieOptions(COOKIE_CONFIG.MAX_AGE.ACCESS_TOKEN);
    const refreshTokenOptions = this.createCookieOptions(COOKIE_CONFIG.MAX_AGE.REFRESH_TOKEN);

    return [
      this.formatCookie(ACCESS_TOKEN, accessToken, accessTokenOptions),
      this.formatCookie(REFRESH_TOKEN, refreshToken, refreshTokenOptions),
    ];
  }

  clearAuthCookies(): string[] {
    const clearOptions = this.createCookieOptions(0);

    return [this.formatCookie(ACCESS_TOKEN, '', clearOptions), this.formatCookie(REFRESH_TOKEN, '', clearOptions)];
  }

  getAccessToken(request: NextRequest): string | null {
    return request.cookies.get(ACCESS_TOKEN)?.value || null;
  }

  getRefreshToken(request: NextRequest): string | null {
    return request.cookies.get(REFRESH_TOKEN)?.value || null;
  }
}

export const cookieManager = new CookieManager();
