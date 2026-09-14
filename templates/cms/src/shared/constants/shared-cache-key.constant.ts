export const SHARED_CACHE_KEYS = {
  cmsData: (locale?: string) => (locale ? `cms:data:${locale}` : 'cms:data'),

  appConfig: () => 'app:config',

  navigation: (locale?: string) => (locale ? `global:navigation:${locale}` : 'global:navigation'),

  i18nMessages: (locale: string, namespace?: string) => (namespace ? `i18n:${locale}:${namespace}` : `i18n:${locale}`),
} as const;
