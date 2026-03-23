'use client';

import { Ticket } from 'lucide-react';
import StateHandler from '@/components/atoms/StateHandler';
import StatusChip from '@/components/atoms/StatusChip';
import { getPriorityChipColor } from '@/app/utils/statusHelpers';

export default function TicketStatusTab({ userTickets, isLoadingTickets, ticketsError }) {
  if (isLoadingTickets || ticketsError) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Ticket Status</h2>
        <StateHandler
          isLoading={isLoadingTickets}
          isError={!!ticketsError}
          error={ticketsError}
          loadingMessage="Loading tickets..."
          errorMessage="Error loading tickets"
          icon={Ticket}
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">My Ticket Status</h2>
      
      {userTickets && userTickets.length > 0 ? (
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
                    Campus
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={ticket.description || '-'}>
                      {ticket.description || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {ticket.ticketType?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getPriorityChipColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <StatusChip value={ticket.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {ticket.campus?.name || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {ticket.assigneeUser 
                        ? `${ticket.assigneeUser.firstName} ${ticket.assigneeUser.lastName}` 
                        : 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
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
          <p className="mt-2 text-sm text-gray-500">No tickets found</p>
        </div>
      )}
    </div>
  );
}
