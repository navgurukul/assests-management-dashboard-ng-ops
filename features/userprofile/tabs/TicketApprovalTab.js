'use client';

import { Ticket, Check, X } from 'lucide-react';
import { useState } from 'react';
import CustomButton from '@/components/atoms/CustomButton';
import TableWrapper from '@/components/Table/TableWrapper';

// Dummy data for testing
const dummyApprovalTickets = [
  {
    id: 1,
    ticketNumber: 'TKT-2024-001',
    description: 'Request for new laptop - HP EliteBook for development work',
    ticketType: 'ASSET_REQUEST',
    priority: 'HIGH',
    status: 'WAITING_FOR_APPROVAL',
    requesterUser: {
      firstName: 'Rahul',
      lastName: 'Sharma'
    },
    createdAt: '2024-02-10T10:30:00Z'
  },
  {
    id: 2,
    ticketNumber: 'TKT-2024-002',
    description: 'Mouse not working properly, need replacement',
    ticketType: 'MAINTENANCE',
    priority: 'MEDIUM',
    status: 'PENDING',
    requesterUser: {
      firstName: 'Priya',
      lastName: 'Verma'
    },
    createdAt: '2024-02-11T14:15:00Z'
  },
  {
    id: 3,
    ticketNumber: 'TKT-2024-003',
    description: 'Additional monitor required for dual screen setup',
    ticketType: 'ASSET_REQUEST',
    priority: 'LOW',
    status: 'WAITING_FOR_APPROVAL',
    createdByUser: {
      firstName: 'Amit',
      lastName: 'Kumar'
    },
    createdAt: '2024-02-12T09:45:00Z'
  },
  {
    id: 4,
    ticketNumber: 'TKT-2024-004',
    description: 'Keyboard keys are sticky, needs cleaning or replacement',
    ticketType: 'MAINTENANCE',
    priority: 'MEDIUM',
    status: 'PENDING',
    requesterUser: {
      firstName: 'Sneha',
      lastName: 'Patel'
    },
    createdAt: '2024-02-13T11:20:00Z'
  },
  {
    id: 5,
    ticketNumber: 'TKT-2024-005',
    description: 'Projector in Conference Room B not displaying properly',
    ticketType: 'REPAIR',
    priority: 'HIGH',
    status: 'WAITING_FOR_APPROVAL',
    requesterUser: {
      firstName: 'Vikram',
      lastName: 'Singh'
    },
    createdAt: '2024-02-14T08:00:00Z'
    }
];

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
    case 'WAITING_FOR_APPROVAL':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'OPEN':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Define columns configuration
const columns = [
  { key: 'ticketNumber', label: 'TICKET NUMBER', align: 'start' },
  { key: 'description', label: 'DESCRIPTION', align: 'start' },
  { key: 'ticketType', label: 'TYPE', align: 'start' },
  { key: 'priority', label: 'PRIORITY', align: 'start' },
  { key: 'status', label: 'STATUS', align: 'start' },
  { key: 'requester', label: 'REQUESTED BY', align: 'start' },
  { key: 'createdAt', label: 'CREATED DATE', align: 'start' },
  { key: 'actions', label: 'ACTIONS', align: 'center' },
];

export default function TicketApprovalTab() {
  const [processingTicket, setProcessingTicket] = useState(null);
  
  // Using dummy data (API not yet implemented)
  const ticketsToDisplay = dummyApprovalTickets;

  const handleApproval = async (ticketId, action) => {
    try {
      setProcessingTicket(ticketId);
      
      // Simulate approval action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      const message = action === 'approve' ? 'Ticket approved successfully' : 'Ticket rejected successfully';
      alert(message);
      
    } catch (error) {
      console.error(`Error ${action}ing ticket:`, error);
      alert(`Failed to ${action} ticket`);
    } finally {
      setProcessingTicket(null);
    }
  };

  // Handle cell rendering
  const renderCell = (ticket, columnKey) => {
    switch (columnKey) {
      case 'ticketNumber':
        return <span className="font-medium text-blue-600">{ticket.ticketNumber}</span>;
      
      case 'description':
        return (
          <span className="text-gray-900 max-w-xs truncate block">
            {ticket.description || '-'}
          </span>
        );
      
      case 'ticketType':
        return (
          <span className="text-gray-700">
            {ticket.ticketType?.replace('_', ' ')}
          </span>
        );
      
      case 'priority':
        return (
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        );
      
      case 'status':
        return (
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        );
      
      case 'requester':
        return (
          <span className="text-gray-700">
            {ticket.requesterUser 
              ? `${ticket.requesterUser.firstName} ${ticket.requesterUser.lastName}` 
              : ticket.createdByUser
              ? `${ticket.createdByUser.firstName} ${ticket.createdByUser.lastName}`
              : 'Unknown'}
          </span>
        );
      
      case 'createdAt':
        return (
          <span className="text-gray-500">
            {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
          </span>
        );
      
      case 'actions':
        return (
          <div className="flex items-center justify-center gap-2">
            <CustomButton
              text="Approve"
              icon={Check}
              variant="success"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleApproval(ticket.id, 'approve');
              }}
              disabled={processingTicket === ticket.id}
            />
            <CustomButton
              text="Reject"
              icon={X}
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleApproval(ticket.id, 'reject');
              }}
              disabled={processingTicket === ticket.id}
            />
          </div>
        );
      
      default:
        return ticket[columnKey];
    }
  };

  return (
    <div>
      <TableWrapper
        data={ticketsToDisplay}
        columns={columns}
        title={
          <div className="flex items-center gap-2">
            Tickets for Approval
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              {ticketsToDisplay.length} pending
            </span>
          </div>
        }
        renderCell={renderCell}
        showPagination={true}
        itemsPerPage={10}
        ariaLabel="Tickets for approval table"
      />
    </div>
  );
}
