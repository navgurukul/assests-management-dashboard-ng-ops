'use client';

import { Ticket, Check, X } from 'lucide-react';
import { useState } from 'react';
import CustomButton from '@/components/atoms/CustomButton';

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

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        Tickets for Approval
        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
          {ticketsToDisplay.length} pending
        </span>
      </h2>
      
      {ticketsToDisplay && ticketsToDisplay.length > 0 ? (
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Number
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ticketsToDisplay.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {ticket.description || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {ticket.ticketType?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {ticket.requesterUser 
                        ? `${ticket.requesterUser.firstName} ${ticket.requesterUser.lastName}` 
                        : ticket.createdByUser
                        ? `${ticket.createdByUser.firstName} ${ticket.createdByUser.lastName}`
                        : 'Unknown'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <CustomButton
                          text="Approve"
                          icon={Check}
                          variant="success"
                          size="sm"
                          onClick={() => handleApproval(ticket.id, 'approve')}
                          disabled={processingTicket === ticket.id}
                        />
                        <CustomButton
                          text="Reject"
                          icon={X}
                          variant="danger"
                          size="sm"
                          onClick={() => handleApproval(ticket.id, 'reject')}
                          disabled={processingTicket === ticket.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Ticket className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No tickets waiting for approval</p>
        </div>
      )}
    </div>
  );
}
