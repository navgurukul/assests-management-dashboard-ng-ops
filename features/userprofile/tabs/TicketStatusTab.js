'use client';

import { Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import StateHandler from '@/components/atoms/StateHandler';
import StatusChip from '@/components/atoms/StatusChip';
import TableWrapper from '@/components/Table/TableWrapper';
import { getPriorityChipColor } from '@/app/utils/statusHelpers';

const columns = [
  { key: 'ticketNumber', label: 'TICKET NUMBER' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'ticketType', label: 'TYPE' },
  { key: 'priority', label: 'PRIORITY' },
  { key: 'status', label: 'STATUS' },
  { key: 'campus', label: 'CAMPUS' },
  { key: 'assignee', label: 'ASSIGNEE' },
  { key: 'createdAt', label: 'CREATED DATE' },
];

export default function TicketStatusTab() {
  const router = useRouter();
  
  const { data: ticketsResponse, isLoading: isLoadingTickets, error: ticketsError } = useFetch({
    url: config.endpoints.tickets.myTickets,
    queryKey: ['myTickets']
  });

  const userTickets = ticketsResponse?.data || ticketsResponse || [];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleRowClick = (ticket) => {
    if (!ticket?.id) return;
    router.push(`/tickets/${ticket.id}`);
  };

  const renderCell = useCallback((ticket, columnKey) => {
    switch (columnKey) {
      case 'ticketNumber':
        return <span className="font-medium text-[var(--theme-main)]">{ticket.ticketNumber}</span>;
      case 'description':
        return (
          <span className="text-gray-900 max-w-xs truncate block" title={ticket.description || '-'}>
            {ticket.description || '-'}
          </span>
        );
      case 'ticketType':
        return <span className="text-gray-700">{ticket.ticketType?.replace('_', ' ')}</span>;
      case 'priority':
        return (
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getPriorityChipColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        );
      case 'status':
        return <StatusChip value={ticket.status} />;
      case 'campus':
        return <span className="text-gray-700">{ticket.campus?.name || '-'}</span>;
      case 'assignee':
        return (
          <span className="text-gray-700">
            {ticket.assigneeUser 
              ? `${ticket.assigneeUser.firstName} ${ticket.assigneeUser.lastName}` 
              : 'Unassigned'}
          </span>
        );
      case 'createdAt':
        return <span className="text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>;
      default:
        return ticket[columnKey] || '-';
    }
  }, []);

  if (isLoadingTickets || ticketsError) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Ticket Status</h2>
        <StateHandler
          isLoading={isLoadingTickets}
          isError={!!ticketsError}
          error={ticketsError?.message || ticketsError}
          loadingMessage="Loading tickets..."
          errorMessage="Error loading tickets"
          icon={Ticket}
          className="py-12"
        />
      </div>
    );
  }

  const handlePageChange = (page) => setCurrentPage(page);
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const totalCount = userTickets?.length || 0;
  const paginatedTickets = userTickets ? userTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize) : [];
  
  const paginationData = {
    page: currentPage,
    limit: pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };

  return (
    <div>
      <TableWrapper
        data={paginatedTickets}
        columns={columns}
        margin='m-0'
        shadow='shadow-none'
        title="My Ticket Status"
        renderCell={renderCell}
        showPagination={true}
        itemsPerPage={pageSize}
        ariaLabel="My Tickets table"
        onRowClick={handleRowClick}
        serverPagination={true}
        paginationData={paginationData}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
