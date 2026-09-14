'use client';

import { type AppExportColumn } from './exportToCSV';

export type { AppExportColumn };

export interface AppExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  columns?: AppExportColumn<T>[];
  filename?: string;
  buttonLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function AppExportButton<T extends Record<string, unknown>>(_props: AppExportButtonProps<T>) {
  return null;
}
