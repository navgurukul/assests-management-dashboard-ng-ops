/**
 * Consignment Table Column Configuration
 * Defines all available columns for the consignments table with metadata
 */

export const CONSIGNMENT_TABLE_ID = 'consignments';

// All available columns for the consignments table
export const consignmentTableColumns = [
  // Column order: consignment id, asset tags, source, destination, courier partner, tracking id, status, actions
  
  // 1. Consignment ID
  { 
    key: 'consignmentCode', 
    label: 'CONSIGNMENT ID', 
    alwaysVisible: true,
    description: 'Unique consignment identifier'
  },
  
  // 2. Asset Tags
  { 
    key: 'assetCount', 
    label: 'ASSETS',
    description: 'Number of assets in consignment'
  },
  
  // 3. Source
  { 
    key: 'source', 
    label: 'SOURCE',
    description: 'Origin location'
  },
  
  // 4. Destination
  { 
    key: 'destination', 
    label: 'DESTINATION',
    description: 'Destination location'
  },
  
  // 5. Courier Partner
  { 
    key: 'courierService', 
    label: 'COURIER PARTNER',
    description: 'Courier service provider'
  },
  
  // 6. Tracking ID
  { 
    key: 'trackingId', 
    label: 'TRACKING ID',
    description: 'Courier tracking ID'
  },
  
  // 7. Allocated To
  { 
    key: 'assignedTo', 
    label: 'ALLOCATED TO',
    description: 'User allocated to this consignment'
  },
  
  // 8. Status
  { 
    key: 'status', 
    label: 'STATUS',
    description: 'Current status (In Transit, Delivered, etc.)'
  },
  
  // 9. Actions
  { 
    key: 'actions', 
    label: 'ACTIONS', 
    alwaysVisible: true,
    description: 'Available actions'
  },
  
  // Optional columns (not visible by default)
  { 
    key: 'allocationCode', 
    label: 'ALLOCATION',
    description: 'Associated allocation code'
  },
  { 
    key: 'shippedAt', 
    label: 'SHIPPED AT',
    description: 'Date when consignment was shipped'
  },
  { 
    key: 'estimatedDeliveryDate', 
    label: 'EST. DELIVERY',
    description: 'Estimated delivery date'
  },
  { 
    key: 'deliveredAt', 
    label: 'DELIVERED AT',
    description: 'Actual delivery date'
  },
  { 
    key: 'createdBy', 
    label: 'CREATED BY',
    description: 'User who created the consignment'
  },
  { 
    key: 'createdAt', 
    label: 'CREATED AT',
    description: 'When consignment was created'
  },
];

// Columns that are visible by default (in order)
export const defaultVisibleColumns = [
  'consignmentCode',    // 1. Consignment ID
  'assetCount',         // 2. Asset Tags
  'source',             // 3. Source
  'destination',        // 4. Destination
  'courierService',     // 5. Courier Partner
  'trackingId',         // 6. Tracking ID
  'assignedTo',         // 7. Assigned To
  'status',             // 8. Status
  'actions',            // 9. Actions
];
