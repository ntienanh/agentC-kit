const CMS_API_BASE_URL = process.env.CMS_SERVICE_URL ?? process.env.NEXT_PUBLIC_CMS_SERVICE_URL ?? '';
const CMS_UPLOAD_BASE_URL = process.env.UPLOAD_SERVICE_URL ?? process.env.NEXT_PUBLIC_UPLOAD_SERVICE_URL ?? '';

export function getCmsApiBaseUrl(): string {
  return CMS_API_BASE_URL;
}

export function getCmsOriginUrl(): string {
  return CMS_API_BASE_URL.replace(/\/api\/?$/, '');
}

export function getCmsUploadBaseUrl(): string {
  return CMS_UPLOAD_BASE_URL || getCmsOriginUrl();
}

export function resolveCmsAssetUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${getCmsOriginUrl()}${url}`;
}
