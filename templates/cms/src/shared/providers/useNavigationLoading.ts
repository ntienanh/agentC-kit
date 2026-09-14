'use client';

import { useContext } from 'react';
import { NavigationLoadingContext } from './NavigationLoadingProvider';

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext);
}
