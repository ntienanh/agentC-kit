const SUPPORTED_FRONT_OFFICE_PROTOCOLS = new Set(['http:', 'https:']);

function isExternalPath(value: string) {
  return /^([a-z][a-z\d+.-]*:|\/\/)/i.test(value);
}

export function normalizeFrontOfficeBaseUrl(value?: string): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    if (!SUPPORTED_FRONT_OFFICE_PROTOCOLS.has(url.protocol) || url.username || url.password) return null;

    url.search = '';
    url.hash = '';
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;

    return url.toString();
  } catch {
    return null;
  }
}

export function buildFrontOfficeHref(baseUrl: string | undefined, path = '/'): string | null {
  const normalizedBaseUrl = normalizeFrontOfficeBaseUrl(baseUrl);
  const requestedPath = path.trim();
  if (!normalizedBaseUrl || isExternalPath(requestedPath)) return null;

  const base = new URL(normalizedBaseUrl);
  const target = new URL(requestedPath.replace(/^\/+/, ''), base);

  if (target.origin !== base.origin || !target.pathname.startsWith(base.pathname)) return null;

  return target.toString();
}

export function getConfiguredFrontOfficeHref(path = '/') {
  return buildFrontOfficeHref(process.env.NEXT_PUBLIC_FRONT_PAGE_URL, path);
}
