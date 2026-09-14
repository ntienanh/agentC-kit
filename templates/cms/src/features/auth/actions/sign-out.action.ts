'use server';

import { APP_CONFIG } from '@/configs/app/app.config';
import { ACCESS_TOKEN, ID_TOKEN, REFRESH_TOKEN } from '@/configs/core/session.config';
import { SHARED_CACHE_TAGS } from '@/shared/constants/shared-cache-tag.constant';
import { AUTH_ERROR_CODES, normalizeApiError } from '@/shared/lib/error';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authApi } from '../services/auth.api';
import { AUTH_CACHE_TAGS } from '../utils/auth-cache-tags';

interface SignOutState {
  errorCode?: string;
  success?: boolean;
}

export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies();

  try {
    await authApi.logout();
  } catch (error) {
    console.error('[SignOut] Error:', normalizeApiError(error, AUTH_ERROR_CODES.LOGOUT_FAILED));
  }

  cookieStore.delete(ACCESS_TOKEN);
  cookieStore.delete(REFRESH_TOKEN);
  cookieStore.delete(ID_TOKEN);

  revalidateTag(AUTH_CACHE_TAGS.USER_SESSION, 'max');
  revalidateTag(AUTH_CACHE_TAGS.USER_PROFILE, 'max');
  revalidateTag(SHARED_CACHE_TAGS.CMS_DATA, 'max');

  redirect(APP_CONFIG.routing.defaultUnauthenticatedRoute);
}

export async function signOutActionWithError(): Promise<SignOutState> {
  try {
    const cookieStore = await cookies();

    await authApi.logout();

    cookieStore.delete(ACCESS_TOKEN);
    cookieStore.delete(REFRESH_TOKEN);
    cookieStore.delete(ID_TOKEN);

    revalidateTag(AUTH_CACHE_TAGS.USER_SESSION, 'max');
    revalidateTag(AUTH_CACHE_TAGS.USER_PROFILE, 'max');
    revalidateTag(SHARED_CACHE_TAGS.CMS_DATA, 'max');

    return { success: true };
  } catch (err: unknown) {
    console.error('[SignOut] Unexpected error:', normalizeApiError(err, AUTH_ERROR_CODES.LOGOUT_FAILED));
    return { errorCode: AUTH_ERROR_CODES.LOGOUT_FAILED };
  }
}
