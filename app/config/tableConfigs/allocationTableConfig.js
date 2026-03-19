

export const ALLOCATION_TABLE_ID = 'allocations';

export const allocationTableColumns = [
  // Always visible columns
  { 
    key: 'allocationId', 
    label: 'ALLOCATION ID',
    description: 'Unique allocation identifier'
  },
  
  // Default visible columns
  { 
    key: 'assetTag', 
    label: 'ASSET WRAPPED',
    description: 'Asset wrapped'
  },
  { 
    key: 'allocationType', 
    label: 'ALLOCATION TYPE',
    description: 'Type of allocation (Campus/User)'
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

  // Optional / extra columns from API
  { 
    key: 'deviceSelectionMode', 
    label: 'SELECTION MODE',
    description: 'How devices were selected (Bulk/Manual)'
  },
  { 
    key: 'sourceCampus', 
    label: 'SOURCE CAMPUS',
    description: 'Campus from which assets are allocated'
  },
  { 
    key: 'destinationCampus', 
    label: 'DESTINATION CAMPUS',
    description: 'Campus to which assets are allocated'
  },
  { 
    key: 'isTemporary', 
    label: 'TEMPORARY',
    description: 'Whether allocation is temporary'
  },
  { 
    key: 'expectedReturnDate', 
    label: 'EXPECTED RETURN',
    description: 'Expected return date for temporary allocations'
  },
  { 
    key: 'ticketId', 
    label: 'TICKET ID',
    description: 'Associated ticket ID'
  },
  { 
    key: 'notes', 
    label: 'NOTES',
    description: 'Additional notes'
  },
  { 
    key: 'createdAt', 
    label: 'CREATED AT',
    description: 'Date allocation was created'
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
  'assetTag',
  'allocationType',
  'startDate',
  'reason',
  'status',
  'deviceSelectionMode',
  'sourceCampus',
  'destinationCampus',
  'actions',
];

// Get column configuration
export const getAllocationTableConfig = () => ({
  tableId: ALLOCATION_TABLE_ID,
  columns: allocationTableColumns,
  defaultVisibleColumns,
});
