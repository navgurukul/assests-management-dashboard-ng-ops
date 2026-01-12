import { useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import {
  initializeTableColumns,
  toggleColumn,
  setVisibleColumns,
  showAllColumns,
  resetToDefaultColumns,
  selectVisibleColumns,
  selectAllColumns,
} from '@/app/store/slices/tableColumnsSlice';


export function useTableColumns(tableId, allColumns, defaultVisibleColumns) {
  const dispatch = useAppDispatch();
  const visibleColumnKeys = useAppSelector(selectVisibleColumns(tableId));
  const storedColumns = useAppSelector(selectAllColumns(tableId));

  // Initialize table columns on first render
  useEffect(() => {
    if (!storedColumns || storedColumns.length === 0) {
      dispatch(
        initializeTableColumns({
          tableId,
          columns: allColumns,
          defaultVisibleColumns: defaultVisibleColumns || allColumns.map(col => col.key),
        })
      );
    }
  }, [tableId, dispatch, storedColumns, allColumns, defaultVisibleColumns]);

  // Get visible columns with full column data
  const visibleColumns = useMemo(() => {
    return allColumns.filter(col => visibleColumnKeys.includes(col.key));
  }, [allColumns, visibleColumnKeys]);

  // Toggle a single column
  const handleToggleColumn = (columnKey) => {
    dispatch(toggleColumn({ tableId, columnKey }));
  };

  // Set specific columns as visible
  const handleSetVisibleColumns = (columnKeys) => {
    dispatch(setVisibleColumns({ tableId, columnKeys }));
  };

  // Show all columns
  const handleShowAllColumns = () => {
    dispatch(showAllColumns({ tableId }));
  };

  // Reset to default columns
  const handleResetToDefault = () => {
    dispatch(
      resetToDefaultColumns({
        tableId,
        defaultVisibleColumns: defaultVisibleColumns || allColumns.map(col => col.key),
      })
    );
  };

  // Check if a column is visible
  const isColumnVisible = (columnKey) => {
    return visibleColumnKeys.includes(columnKey);
  };

  // Get columns that are always visible (can't be hidden)
  const alwaysVisibleColumns = useMemo(() => {
    return allColumns.filter(col => col.alwaysVisible).map(col => col.key);
  }, [allColumns]);

  return {
    visibleColumns,
    visibleColumnKeys,
    allColumns,
    toggleColumn: handleToggleColumn,
    setVisibleColumns: handleSetVisibleColumns,
    showAllColumns: handleShowAllColumns,
    resetToDefault: handleResetToDefault,
    isColumnVisible,
    alwaysVisibleColumns,
  };
}
