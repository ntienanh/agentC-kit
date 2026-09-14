export interface AppExportColumn<T> {
  key: keyof T | string;
  label: string;
  transform?: (row: T) => string | number | boolean | null | undefined;
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns?: AppExportColumn<T>[],
  filename = 'export.csv',
) {
  if (!data || data.length === 0) return;

  const activeColumns: { label: string; getValue: (row: T) => string }[] = columns
    ? columns.map(col => ({
        label: col.label,
        getValue: (row: T) => {
          if (col.transform) {
            const val = col.transform(row);
            return val == null ? '' : String(val);
          }
          const raw = row[col.key as string];
          return raw == null ? '' : String(raw);
        },
      }))
    : Object.keys(data[0]).map(key => ({
        label: key,
        getValue: (row: T) => {
          const raw = row[key];
          return raw == null ? '' : String(raw);
        },
      }));

  const headerRow = activeColumns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');

  const bodyRows = data.map(row =>
    activeColumns
      .map(col => {
        const value = col.getValue(row);
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(','),
  );

  const csvContent = '\uFEFF' + [headerRow, ...bodyRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
