'use client';

import { createContext } from 'react';
import type { AppAbility } from '../ability/ability';

export const AbilityContext = createContext<AppAbility | null>(null);
