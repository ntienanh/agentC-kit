import { authApi } from './auth.api';

export async function serverLogout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    void 0;
  }
}

export async function serverLogoutAndRedirect(
  router: { push: (href: string) => void },
  href: string,
): Promise<void> {
  await serverLogout();
  router.push(href);
}
