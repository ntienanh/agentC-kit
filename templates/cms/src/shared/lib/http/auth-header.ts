export function createBearerToken(token: string): string {
  return `Bearer ${token}`;
}

export function createAuthorizationHeader(token: string | null | undefined): Record<string, string> {
  return token ? { Authorization: createBearerToken(token) } : {};
}
