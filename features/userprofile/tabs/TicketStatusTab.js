'use client';

import { Ticket, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import StateHandler from '@/components/atoms/StateHandler';
import StatusChip from '@/components/atoms/StatusChip';
import TableWrapper from '@/components/Table/TableWrapper';
import ActionMenu from '@/components/molecules/ActionMenu';
import FormModal from '@/components/molecules/FormModal';
import { getPriorityChipColor } from '@/app/utils/statusHelpers';
import apiService from '@/app/utils/apiService';
import { toast } from '@/app/utils/toast';
import { useAuth } from '@/app/context/AuthContext';

const columns = [
  { key: 'ticketNumber', label: 'TICKET TAG' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'ticketType', label: 'TYPE' },
  { key: 'priority', label: 'PRIORITY' },
  { key: 'status', label: 'STATUS' },
  { key: 'campus', label: 'CAMPUS' },
  { key: 'assignee', label: 'ASSIGNEE' },
  { key: 'createdAt', label: 'CREATED DATE' },
  { key: 'actions', label: 'ACTIONS' },
];

const CANCELLABLE_STATUSES = ['RAISED', 'OPEN', 'APPROVED', 'IN_PROGRESS', 'OVERDUE'];

export default function TicketStatusTab() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const showCreateTicketButton = pathname === '/ticketstatus';

  const { data: ticketsResponse, isLoading: isLoadingTickets, error: ticketsError, refetch } = useFetch({
    url: config.endpoints.tickets.myTickets,
    queryKey: ['myTickets']
  });

  const userTickets = ticketsResponse?.data || ticketsResponse || [];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, ticket: null });
  const [processingId, setProcessingId] = useState(null);

  const { mutateAsync: cancelTicket, isPending: isCancelling } = useMutation({
    mutationFn: ({ endpoint, body }) => apiService.put(endpoint, body),
  });

  const handleRowClick = (ticket) => {
    if (!ticket?.id) return;
    router.push(`/tickets/${ticket.id}`);
  };

  const handleCreateClick = () => {
    router.push('/tickets/create');
  };

  const openCancelModal = (ticket) => {
    setCancelModal({ isOpen: true, ticket });
  };

  const closeCancelModal = () => setCancelModal({ isOpen: false, ticket: null });

  const handleCancelSubmit = async (formData) => {
    const ticket = cancelModal.ticket;
    const ticketId = ticket?.id || ticket?.ticketId;
    if (!ticketId) return;

    setProcessingId(ticketId);
    let loadingToastId = null;
    try {
      loadingToastId = toast.loading('Cancelling ticket...');
      await cancelTicket({
        endpoint: config.endpoints.tickets.update(ticketId),
        body: {
          status: 'CANCELLED',
          comment: formData?.comment || 'Cancelled by requester',
        },
      });
      toast.dismiss(loadingToastId);
      toast.success('Ticket cancelled successfully!');
      refetch();
      closeCancelModal();
    } catch (err) {
      if (loadingToastId) toast.dismiss(loadingToastId);
      toast.error(err?.message || 'Failed to cancel ticket.');
    } finally {
      setProcessingId(null);
    }
  };

  const isOwnTicket = (ticket) => {
    const raiser = ticket.raisedByUser?.email;
    return raiser && user?.email && raiser === user.email;
  };

  const isAssetAllocated = (ticket) =>
    !!(ticket.assetId || (ticket.assetIds?.length > 0));

  const canCancel = (ticket) =>
    isOwnTicket(ticket) &&
    CANCELLABLE_STATUSES.includes(ticket.status) &&
    !isAssetAllocated(ticket);
  
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
      case 'actions':
        if (!canCancel(ticket)) return null;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ActionMenu
              menuOptions={[
                {
                  label: 'Cancel Ticket',
                  icon: X,
                  iconClassName: 'text-red-600',
                  onClick: (e) => {
                    e?.stopPropagation?.();
                    openCancelModal(ticket);
                  },
                },
              ]}
              disabled={processingId === (ticket.id || ticket.ticketId)}
            />
          </div>
        );
      default:
        return ticket[columnKey] || '-';
    }
  }, [processingId, user]);

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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col">
        <FormModal
          isOpen={cancelModal.isOpen}
          onClose={closeCancelModal}
          componentName={cancelModal.ticket?.ticketNumber || ''}
          actionType="Cancel"
          fields={[
            {
              name: 'comment',
              label: 'Reason for Cancellation',
              type: 'textarea',
              required: true,
              placeholder: 'Describe the reason for cancelling this ticket(e.g. duplicate ticket, raised by mistake, or issue no longer applies).',
            },
          ]}
          onSubmit={handleCancelSubmit}
          size="medium"
          isSubmitting={isCancelling}
          componentData={cancelModal.ticket}
          helpText={cancelModal.ticket?.description || ''}
        />
        <TableWrapper
          data={paginatedTickets}
          columns={columns}
          margin='m-0'
          shadow='shadow-none'
          title="My Ticket Status"
          renderCell={renderCell}
          showPagination={true}
          showCreateButton={showCreateTicketButton}
          createButtonText="Create Ticket"
          onCreateClick={handleCreateClick}
          itemsPerPage={pageSize}
          ariaLabel="My Tickets table"
          onRowClick={handleRowClick}
          serverPagination={true}
          paginationData={paginationData}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
