import createMiddleware from 'next-intl/middleware';
import { routing } from './core/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;
export { intlMiddleware as proxy, intlMiddleware as middleware };

export const config = {
  matcher: ['/', '/(vi|en)/:path*', '/((?!_next|_vercel|api|.*\\..*).*)'],
};
