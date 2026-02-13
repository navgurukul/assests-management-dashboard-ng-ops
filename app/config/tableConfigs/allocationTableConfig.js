

export const ALLOCATION_TABLE_ID = 'allocations';

export const allocationTableColumns = [
  // Always visible columns
  { 
    key: 'allocationId', 
    label: 'ALLOCATION ID',
    alwaysVisible: true,
    description: 'Unique allocation identifier'
  },
  
  // Default visible columns
  { 
    key: 'assetTag', 
    label: 'ASSET TAG',
    description: 'Asset tag assigned'
  },
  { 
    key: 'userName', 
    label: 'ASSIGNED TO',
    description: 'User receiving the allocation'
  },
  { 
    key: 'startDate', 
    label: 'START DATE',
    description: 'Allocation start date'
  },
  { 
    key: 'endDate', 
    label: 'END DATE',
    description: 'Allocation end date or status'
  },
  { 
    key: 'reason', 
    label: 'REASON',
    description: 'Reason for allocation'
  },
  { 
    key: 'status', 
    label: 'STATUS',
    description: 'Current allocation status'
  },
  
  // Actions column - always visible
  { 
    key: 'actions', 
    label: 'ACTIONS', 
    alwaysVisible: true,
    description: 'Available actions'
  },
];

// Default visible columns (shown when user first visits or resets)
export const defaultVisibleColumns = [
  'allocationId',
  'assetTag',
  'userName',
  'startDate',
  'endDate',
  'reason',
  'status',
  'actions',
];

// Get column configuration
export const getAllocationTableConfig = () => ({
  tableId: ALLOCATION_TABLE_ID,
  columns: allocationTableColumns,
  defaultVisibleColumns,
});
