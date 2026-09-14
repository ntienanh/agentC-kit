import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_PAGES, DEFAULT_LOGIN_REDIRECT, SIGN_IN_PATH } from './configs/app/auth/auth-flow.config';
import { LOCALE_COOKIE_NAME } from './configs/app/locale.config';
import { ACCESS_TOKEN } from './configs/core/session.config';
import { routing } from './shared/i18n/routing';

const intlMiddleware = createMiddleware(routing);
const PUBLIC_PAGES = ['/not-found-workspace', '/403', '/404'];

function getLocaleFromRequest(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const supportedLocales = routing.locales as readonly string[];

  if (cookieLocale && supportedLocales.includes(cookieLocale)) {
    return cookieLocale;
  }

  return routing.defaultLocale;
}

function getLocalizedPath(path: string, locale: string): string {
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path}`;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN)?.value;
  const { pathname } = request.nextUrl;
  const supportedLocales = routing.locales as readonly string[];
  const pathnameLocale = supportedLocales.find(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );
  const strippedPathname = pathnameLocale ? pathname.slice(`/${pathnameLocale}`.length) || '/' : pathname;
  const isAuthPage = Array.from(AUTH_PAGES).some(path => strippedPathname.includes(path));
  const isPublicPage = PUBLIC_PAGES.some(path => strippedPathname === path || strippedPathname.startsWith(`${path}/`));
  const locale = getLocaleFromRequest(request);

  if (token && isAuthPage) {
    const redirectPath = getLocalizedPath(DEFAULT_LOGIN_REDIRECT, locale);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (!token && !isAuthPage && !isPublicPage) {
    const redirectPath = getLocalizedPath(SIGN_IN_PATH, locale);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return intlMiddleware(request);
}

export default middleware;
export { middleware as proxy };

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
