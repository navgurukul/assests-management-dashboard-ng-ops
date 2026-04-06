
export const TICKET_TABLE_ID = 'tickets';

import { getPriorityChipColor, getStatusChipColor } from '@/app/utils/statusHelpers';

// All available columns for the tickets table
export const ticketTableColumns = [
  // Always visible columns
  { 
    key: 'ticketId', 
    label: 'TICKET ID', 
    alwaysVisible: true,
    description: 'Unique ticket identifier',
    type: 'boldText'
  },
  
  { 
    key: 'type', 
    label: 'TYPE',
    description: 'Ticket type (NEW, REPAIR, etc.)'
  },
  { 
    key: 'device', 
    label: 'DEVICE',
    description: 'Asset tag or device identifier'
  },
  { 
    key: 'status', 
    label: 'STATUS',
    description: 'Current ticket status',
    type: 'chip'
  },
  { 
    key: 'sla', 
    label: 'TIMELINE',
    description: 'Service Level Agreement indicator',
    type: 'sla'
  },
  { 
    key: 'actionTakenBy', 
    label: 'ACTION TAKEN BY',
    description: 'User who last updated the ticket'
  },
  { 
    key: 'updated', 
    label: 'UPDATED',
    description: 'Last update date',
    type: 'date'
  },
  
  { 
    key: 'priority', 
    label: 'PRIORITY',
    description: 'Ticket priority level',
    type: 'chip',
    colorFn: getPriorityChipColor
  },
  { 
    key: 'campus', 
    label: 'CAMPUS',
    description: 'Campus location'
  },
  { 
    key: 'raisedBy', 
    label: 'RAISED BY',
    description: 'User who created the ticket',
    type: 'userWithEmail'
  },
  { 
    key: 'assignedTo', 
    label: 'ASSIGNED TO',
    description: 'User assigned to the ticket',
    type: 'userWithEmail'
  },
  { 
    key: 'raisedByEmail', 
    label: 'RAISED BY EMAIL',
    description: 'Email of user who raised the ticket'
  },
  { 
    key: 'assigneeEmail', 
    label: 'ASSIGNEE EMAIL',
    description: 'Email of user assigned to the ticket'
  },
  { 
    key: 'createdAt', 
    label: 'CREATED AT',
    description: 'Ticket creation date',
    type: 'date'
  },
  { 
    key: 'assignDate', 
    label: 'ASSIGN DATE',
    description: 'Date when ticket was assigned',
    type: 'date'
  },
  { 
    key: 'resolvedAt', 
    label: 'RESOLVED AT',
    description: 'Date when ticket was resolved',
    type: 'date'
  },
  { 
    key: 'closedAt', 
    label: 'CLOSED AT',
    description: 'Date when ticket was closed',
    type: 'date'
  },
];

// Default visible columns (shown when user first visits or resets)
export const defaultVisibleColumns = [
  'ticketId',
  'type',
  'priority',
  'status',
  'sla',
  'createdAt',
  'assignDate',
  'raisedBy',
  'assignedTo',
  'actionTakenBy',
];

// Get column configuration
export const getTicketTableConfig = () => ({
  tableId: TICKET_TABLE_ID,
  columns: ticketTableColumns,
  defaultVisibleColumns,
});
