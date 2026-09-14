'use client';

import { useCallback, useState } from 'react';

export function useTableSelection<T extends { id?: string | number }>(_keyField: keyof T = 'id' as keyof T) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const handleSelectionChange = useCallback((newSelectedRowKeys: React.Key[], newSelectedRows: T[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, []);

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange,
  };

  return {
    selectedRowKeys,
    selectedRows,
    setSelectedRowKeys,
    handleSelectionChange,
    clearSelection,
    rowSelection,
    hasSelection: selectedRowKeys.length > 0,
    selectedCount: selectedRowKeys.length,
  };
}
