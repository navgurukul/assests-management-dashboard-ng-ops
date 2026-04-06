

export const ALLOCATION_TABLE_ID = 'allocations';

import {
  getAllocationTypeChipColor,
  getAllocationReasonChipColor,
  getDeviceModeChipColor,
  getStatusChipColor,
} from '@/app/utils/statusHelpers';

export const allocationTableColumns = [
  // Always visible columns
  { 
    key: 'allocationId', 
    label: 'ALLOCATION ID',
    description: 'Unique allocation identifier',
    type: 'id',
    prefix: '#'
  },
  
  // Default visible columns
  { 
    key: 'assetTag', 
    label: 'ASSET TAG',
    description: 'Asset tag',
    type: 'boldText'
  },
  { 
    key: 'brandModel', 
    label: 'BRAND / MODEL',
    description: 'Asset brand and model'
  },
  { 
    key: 'allocationType', 
    label: 'ALLOCATION TYPE',
    description: 'Type of allocation (Campus/User)',
    type: 'chip',
    colorFn: getAllocationTypeChipColor
  },
  {
    key: 'userName',
    label: 'USER NAME',
    description: 'Assigned user',
    type: 'user'
  },
  { 
    key: 'startDate', 
    label: 'START DATE',
    description: 'Allocation start date',
    type: 'date'
  },
  { 
    key: 'endDate', 
    label: 'END DATE',
    description: 'Allocation end date or status',
    type: 'date'
  },
  { 
    key: 'reason', 
    label: 'REASON',
    description: 'Reason for allocation',
    type: 'chip',
    colorFn: getAllocationReasonChipColor
  },
  { 
    key: 'status', 
    label: 'STATUS',
    description: 'Current allocation status',
    type: 'chip',
    colorFn: getStatusChipColor
  },

  // Optional / extra columns from API
  { 
    key: 'deviceSelectionMode', 
    label: 'SELECTION MODE',
    description: 'How devices were selected (Bulk/Manual)',
    type: 'chip',
    colorFn: getDeviceModeChipColor
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
    description: 'Whether allocation is temporary',
    type: 'badge'
  },
  { 
    key: 'expectedReturnDate', 
    label: 'EXPECTED RETURN',
    description: 'Expected return date for temporary allocations',
    type: 'date'
  },
  { 
    key: 'ticketId', 
    label: 'TICKET ID',
    description: 'Associated ticket ID',
    type: 'id',
    prefix: '#'
  },
  { 
    key: 'notes', 
    label: 'NOTES',
    description: 'Additional notes',
    type: 'truncate',
    maxWidth: '180px'
  },
  { 
    key: 'createdAt', 
    label: 'CREATED AT',
    description: 'Date allocation was created',
    type: 'date'
  }
];

// Default visible columns (shown when user first visits or resets)
export const defaultVisibleColumns = [
  'assetTag',
  'allocationType',
  'startDate',
  'status',
  'deviceSelectionMode',
  'sourceCampus',
  'destinationCampus'
];

// Get column configuration
export const getAllocationTableConfig = () => ({
  tableId: ALLOCATION_TABLE_ID,
  columns: allocationTableColumns,
  defaultVisibleColumns,
});
