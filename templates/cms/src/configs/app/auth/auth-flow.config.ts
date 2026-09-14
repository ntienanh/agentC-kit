import { APP_HREFS } from '../features/navigation.config';

const isProduction = process.env.NODE_ENV === 'production';

export const AUTH_PAGES = new Set([
  APP_HREFS.SIGNIN,
  APP_HREFS.FORGOT_PASSWORD,
  APP_HREFS.RESET_PASSWORD,
  APP_HREFS.FORBIDDEN,
]);

export const DEFAULT_LOGIN_REDIRECT = APP_HREFS.DASHBOARD;
export const SIGN_IN_PATH = APP_HREFS.SIGNIN;
export const AUTH_UI = {
  SUCCESS_REDIRECT_DELAY_MS: 2500,
} as const;

export const COOKIE_CONFIG = {
  PATH: '/',
  HTTP_ONLY: true,
  SAME_SITE: 'lax' as const,
  MAX_AGE: {
    ACCESS_TOKEN: 60 * 60,
    REFRESH_TOKEN: 60 * 60 * 24 * 7,
  },
  SECURE: isProduction,
} as const;
