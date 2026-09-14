export const enum APP_LOCALES {
  EN = 'en',
  VI = 'vi',
}

export const DEFAULT_LOCALE = APP_LOCALES.EN;
export const SUPPORTED_LOCALES = [APP_LOCALES.EN, APP_LOCALES.VI] as const;
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
