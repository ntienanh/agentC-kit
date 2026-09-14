import {
  ACCESS_TOKEN,
  ID_TOKEN,
  REFRESH_TOKEN,
  SESSION_STORAGE_KEYS,
  SESSION_TIMING,
} from '@/configs/core/session.config';
import { cookieStorage } from '@/shared/lib/cookies.util';
import dayjs from '@/shared/utils/dayjs.util';
import type { IUserDto } from '@repo/contracts';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserInfo = IUserDto & {
  permissions?: string[];
  accessibleStoreIds?: string[];
};

interface UserState {
  user: UserInfo | null;
  tokenExpiry: number | null;
  nextRefreshAt: number | null;
  setUser: (user: UserInfo, expiresIn?: number) => void;
  updateTokenExpiry: (expiresIn: number) => void;
  updateDisplayName: (displayName: string) => void;
  clearUser: () => void;
  logout: () => void;
}

function resolveSessionTiming(expiresIn: number) {
  const now = dayjs().valueOf();
  const expiresInMs = expiresIn * SESSION_TIMING.ONE_SECOND_MS;
  const tokenExpiry = now + expiresInMs;
  const nextRefreshAt = now + Math.max(expiresInMs - SESSION_TIMING.REFRESH_BUFFER_MS, 0);

  return { tokenExpiry, nextRefreshAt };
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      user: null,
      tokenExpiry: null,
      nextRefreshAt: null,
      setUser: (user, expiresIn) => {
        set(state => {
          if (typeof expiresIn !== 'number' || !Number.isFinite(expiresIn) || expiresIn <= 0) {
            return { ...state, user };
          }

          const { tokenExpiry, nextRefreshAt } = resolveSessionTiming(expiresIn);

          return {
            ...state,
            user,
            tokenExpiry,
            nextRefreshAt,
          };
        });
      },
      updateTokenExpiry: expiresIn => {
        set(resolveSessionTiming(expiresIn));
      },
      updateDisplayName: displayName =>
        set(state => ({
          user: state.user ? { ...state.user, displayName } : null,
        })),
      clearUser: () => set({ user: null, tokenExpiry: null, nextRefreshAt: null }),
      logout: () => {
        set({ user: null, tokenExpiry: null, nextRefreshAt: null });
        cookieStorage.remove(ACCESS_TOKEN);
        cookieStorage.remove(REFRESH_TOKEN);
        cookieStorage.remove(ID_TOKEN);
      },
    }),
    {
      name: SESSION_STORAGE_KEYS.USER,
      partialize: state => ({
        user: state.user
          ? {
              id: state.user.id,
              email: state.user.email,
              displayName: state.user.displayName,
              avatar: state.user.avatar,
              phone: state.user.phone,
              role: state.user.role,
              status: state.user.status,
              emailVerified: state.user.emailVerified,
              createdAt: state.user.createdAt,
              updatedAt: state.user.updatedAt,
              permissions: state.user.permissions,
              accessibleStoreIds: state.user.accessibleStoreIds,
            }
          : null,
      }),
    },
  ),
);
