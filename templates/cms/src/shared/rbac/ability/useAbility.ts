'use client';

import { useContext } from 'react';
import { AbilityContext } from '../context/AbilityContext';

export const useAbility = () => {
  const ctx = useContext(AbilityContext);
  if (!ctx) {
    throw new Error('useAbility must be used within AbilityProvider');
  }
  return ctx;
};
