/**
 * Asset Table Column Configuration
 * Defines all available columns for the assets table with metadata
 */

export const ASSET_TABLE_ID = 'assets';

// All available columns for the assets table
export const assetTableColumns = [
  // Always visible columns
  { 
    key: 'status', 
    label: 'STATUS',
    description: 'Current status (In Stock, Allocated, etc.)'
  },
  { 
    key: 'assetTag', 
    label: 'ASSET TAG', 
    alwaysVisible: true,
    description: 'Unique asset identifier'
  },
  
  // Default visible columns
  { 
    key: 'type', 
    label: 'TYPE',
    description: 'Asset type (e.g., Laptop, Desktop)'
  },
  { 
    key: 'brand', 
    label: 'BRAND',
    description: 'Manufacturer brand'
  },
  { 
    key: 'model', 
    label: 'MODEL',
    description: 'Device model'
  },
  { 
    key: 'serialNumber', 
    label: 'SERIAL NUMBER',
    description: 'Device serial number'
  },
  { 
    key: 'condition', 
    label: 'CONDITION',
    description: 'Physical condition (Working, Damaged, etc.)'
  },
  { 
    key: 'campus', 
    label: 'CAMPUS',
    description: 'Campus location'
  },
  { 
    key: 'location', 
    label: 'LOCATION',
    description: 'Specific location within campus'
  },
  
  // Optional columns (not visible by default)
  { 
    key: 'processor', 
    label: 'PROCESSOR',
    description: 'CPU processor type'
  },
  { 
    key: 'ramSizeGB', 
    label: 'RAM (GB)',
    description: 'RAM size in gigabytes'
  },
  { 
    key: 'storageSizeGB', 
    label: 'STORAGE (GB)',
    description: 'Storage size in gigabytes'
  },
  { 
    key: 'sourceType', 
    label: 'SOURCE TYPE',
    description: 'How asset was acquired (Purchased, Donated, etc.)'
  },
  { 
    key: 'ownedBy', 
    label: 'OWNED BY',
    description: 'Organization owning the asset'
  },
  { 
    key: 'purchaseDate', 
    label: 'PURCHASE DATE',
    description: 'Date of purchase'
  },
  { 
    key: 'cost', 
    label: 'COST',
    description: 'Purchase cost'
  },
  { 
    key: 'specLabel', 
    label: 'SPEC LABEL',
    description: 'Specification label'
  },
  { 
    key: 'sourceBy', 
    label: 'SOURCE BY',
    description: 'Who sourced the asset'
  },
  { 
    key: 'createdAt', 
    label: 'CREATED AT',
    description: 'Record creation date'
  },
  { 
    key: 'updatedAt', 
    label: 'UPDATED AT',
    description: 'Last update date'
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
  'status',
  'assetTag',
  'type',
  'brand',
  'model',
  'serialNumber',
  'condition',
  'campus',
  'location',
  'actions',
];

// Get column configuration
export const getAssetTableConfig = () => ({
  tableId: ASSET_TABLE_ID,
  columns: assetTableColumns,
  defaultVisibleColumns,
});
