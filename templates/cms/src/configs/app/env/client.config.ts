export const ENV_CLIENT = {
  CMS_SERVICE_URL: process.env.CMS_SERVICE_URL!,
  UPLOAD_SERVICE_URL: process.env.UPLOAD_SERVICE_URL!,
  APP_NAME: process.env.APP_NAME || 'Admin Panel',
  LOGO_URL: process.env.LOGO_URL || '/logo.png',
  LOGO_ICON_URL: process.env.LOGO_ICON_URL || '/logo-icon.png',
} as const;
