import { createSlice } from '@reduxjs/toolkit';

/**
 * Centralized Redux slice for managing table column visibility
 * Can be used across multiple tables in the application
 */

const initialState = {
  // Store column visibility state for different tables
  // Key: tableId (e.g., 'assets', 'tickets', 'allocations')
  // Value: { visibleColumns: [], allColumns: [] }
  tables: {},
};

const tableColumnsSlice = createSlice({
  name: 'tableColumns',
  initialState,
  reducers: {
    // Initialize a table with its columns configuration
    initializeTableColumns: (state, action) => {
      const { tableId, columns, defaultVisibleColumns } = action.payload;
      
      if (!state.tables[tableId]) {
        state.tables[tableId] = {
          allColumns: columns,
          visibleColumns: defaultVisibleColumns || columns.map(col => col.key),
        };
      }
    },

    // Toggle a single column visibility
    toggleColumn: (state, action) => {
      const { tableId, columnKey } = action.payload;
      
      if (state.tables[tableId]) {
        const visibleColumns = state.tables[tableId].visibleColumns;
        const index = visibleColumns.indexOf(columnKey);
        
        if (index > -1) {
          // Remove column if already visible
          state.tables[tableId].visibleColumns = visibleColumns.filter(
            key => key !== columnKey
          );
        } else {
          // Add column if not visible
          state.tables[tableId].visibleColumns.push(columnKey);
        }
      }
    },

    // Set visible columns directly
    setVisibleColumns: (state, action) => {
      const { tableId, columnKeys } = action.payload;
      
      if (state.tables[tableId]) {
        state.tables[tableId].visibleColumns = columnKeys;
      }
    },

    // Show all columns
    showAllColumns: (state, action) => {
      const { tableId } = action.payload;
      
      if (state.tables[tableId]) {
        state.tables[tableId].visibleColumns = state.tables[tableId].allColumns.map(
          col => col.key
        );
      }
    },

    // Reset to default columns
    resetToDefaultColumns: (state, action) => {
      const { tableId, defaultVisibleColumns } = action.payload;
      
      if (state.tables[tableId]) {
        state.tables[tableId].visibleColumns = defaultVisibleColumns;
      }
    },

    // Hide all columns except required ones
    hideAllExceptRequired: (state, action) => {
      const { tableId, requiredColumns } = action.payload;
      
      if (state.tables[tableId]) {
        state.tables[tableId].visibleColumns = requiredColumns;
      }
    },
  },
});

export const {
  initializeTableColumns,
  toggleColumn,
  setVisibleColumns,
  showAllColumns,
  resetToDefaultColumns,
  hideAllExceptRequired,
} = tableColumnsSlice.actions;

// Selectors
export const selectTableColumns = (tableId) => (state) => 
  state.tableColumns.tables[tableId];

export const selectVisibleColumns = (tableId) => (state) => 
  state.tableColumns.tables[tableId]?.visibleColumns || [];

export const selectAllColumns = (tableId) => (state) => 
  state.tableColumns.tables[tableId]?.allColumns || [];

export const selectIsColumnVisible = (tableId, columnKey) => (state) => 
  state.tableColumns.tables[tableId]?.visibleColumns.includes(columnKey) || false;

export default tableColumnsSlice.reducer;
