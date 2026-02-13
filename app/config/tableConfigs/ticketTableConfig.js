
export const TICKET_TABLE_ID = 'tickets';

// All available columns for the tickets table
export const ticketTableColumns = [
  // Always visible columns
  { 
    key: 'ticketId', 
    label: 'TICKET ID', 
    alwaysVisible: true,
    description: 'Unique ticket identifier'
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
    description: 'Current ticket status'
  },
  { 
    key: 'sla', 
    label: 'SLA',
    description: 'Service Level Agreement indicator'
  },
  { 
    key: 'actionTakenBy', 
    label: 'ACTION TAKEN BY',
    description: 'User who last updated the ticket'
  },
  { 
    key: 'updated', 
    label: 'UPDATED',
    description: 'Last update date'
  },
  
  { 
    key: 'priority', 
    label: 'PRIORITY',
    description: 'Ticket priority level'
  },
  { 
    key: 'campus', 
    label: 'CAMPUS',
    description: 'Campus location'
  },
  { 
    key: 'raisedBy', 
    label: 'RAISED BY',
    description: 'User who created the ticket'
  },
  { 
    key: 'assignedTo', 
    label: 'ASSIGNED TO',
    description: 'User assigned to the ticket'
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
    description: 'Ticket creation date'
  },
  { 
    key: 'assignDate', 
    label: 'ASSIGN DATE',
    description: 'Date when ticket was assigned'
  },
  { 
    key: 'resolvedAt', 
    label: 'RESOLVED AT',
    description: 'Date when ticket was resolved'
  },
  { 
    key: 'closedAt', 
    label: 'CLOSED AT',
    description: 'Date when ticket was closed'
  },
];

// Default visible columns (shown when user first visits or resets)
export const defaultVisibleColumns = [
  'ticketId',
  'type',
  'priority',
  'status',
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
