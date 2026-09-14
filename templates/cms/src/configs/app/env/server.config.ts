export const ENV_SERVER = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  NODE_ENV: process.env.NODE_ENV!,
  USER_SERVICE_URL: process.env.USER_SERVICE_URL!,
  CMS_SERVICE_URL: process.env.CMS_SERVICE_URL!,
  CDN_URL: process.env.CDN_URL!,
  UPLOAD_SERVICE_URL: process.env.UPLOAD_SERVICE_URL!,
  CDN_NAME: process.env.CDN_NAME!,
  FRONT_PAGE_URL: process.env.FRONT_PAGE_URL,
} as const;
