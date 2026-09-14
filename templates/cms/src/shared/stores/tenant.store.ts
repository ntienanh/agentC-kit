'use client';

import { registerActiveStoreIdGetter, registerActiveTenantIdGetter } from '@/shared/lib/http/client.fetcher';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TenantState = {
  activeTenantId: string | null;
  activeStoreId: string | null;
  setActiveTenantId: (tenantId: string | null) => void;
  setActiveStoreId: (storeId: string | null) => void;
};

export const ACTIVE_TENANT_STORAGE_KEY = 'active_tenant_id';

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeTenantId: null,
      activeStoreId: null,
      setActiveTenantId: (tenantId) => set({ activeTenantId: tenantId, activeStoreId: tenantId }),
      setActiveStoreId: (storeId) => set({ activeTenantId: storeId, activeStoreId: storeId }),
    }),
    {
      name: ACTIVE_TENANT_STORAGE_KEY,
      partialize: (state) => ({ activeTenantId: state.activeTenantId, activeStoreId: state.activeStoreId }),
    },
  ),
);

registerActiveStoreIdGetter(() => useTenantStore.getState().activeStoreId ?? useTenantStore.getState().activeTenantId);
registerActiveTenantIdGetter(() => useTenantStore.getState().activeTenantId ?? useTenantStore.getState().activeStoreId);
