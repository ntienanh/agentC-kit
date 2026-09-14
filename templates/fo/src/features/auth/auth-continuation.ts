const DEFAULT_POST_AUTH_PATH = '/profile';

export function resolveAuthContinuation(value?: string | null) {
  const candidate = value?.trim();
  return candidate?.startsWith('/') && !candidate.startsWith('//')
    ? candidate
    : DEFAULT_POST_AUTH_PATH;
}

export function buildAuthContinuationHref(path: string, nextPath?: string | null) {
  const params = new URLSearchParams({ next: resolveAuthContinuation(nextPath) });
  return `${path}?${params.toString()}`;
}
