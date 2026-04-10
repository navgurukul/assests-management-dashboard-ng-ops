'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import TableWrapper from '@/components/Table/TableWrapper';
import ActionMenu from '@/components/molecules/ActionMenu';
import FormModal from '@/components/molecules/FormModal';
import { toast } from '@/app/utils/toast';
import { useAuth } from '@/app/context/AuthContext';
import useFetch from '@/app/hooks/query/useFetch';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
import StateHandler from '@/components/atoms/StateHandler';
import StatusChip from '@/components/atoms/StatusChip';
import { getPriorityChipColor } from '@/app/utils/statusHelpers';
import {
  getTicketActionFields,
  ticketApprovalValidationSchema,
} from '@/app/config/formConfigs/ticketApprovalModalConfig';

const INITIAL_MODAL_STATE = { isOpen: false, actionType: null, ticket: null };

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

function getRequesterName(ticket) {
  const requester = ticket.raisedByUser || ticket.requesterUser || ticket.createdByUser;
  return requester ? `${requester.firstName} ${requester.lastName}` : 'Unknown';
}

function getTicketId(ticket) {
  return ticket.id || ticket.ticketId;
}

export default function TicketApprovalTab() {
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalState, setModalState] = useState(INITIAL_MODAL_STATE);
  const [processingId, setProcessingId] = useState(null);

  const managerEmail = user?.email;
  const queryString = new URLSearchParams({ page: currentPage, limit: pageSize }).toString();

  const { data, isLoading, isError, error, refetch } = useFetch({
    url: `${config.endpoints.tickets.pendingApproval}/${encodeURIComponent(managerEmail ?? '')}?${queryString}`,
    queryKey: ['pending-approval-tickets', managerEmail, currentPage, pageSize],
    enabled: !!managerEmail,
  });

  const tickets = data?.data?.tickets || [];
  const paginationData = data?.data?.pagination || null;

  const { mutateAsync: updateTicket, isPending: isSubmitting } = useMutation({
    mutationFn: ({ endpoint, body }) => apiService.put(endpoint, body),
  });

  const openModal = (actionType, ticket) => {
    setModalState({ isOpen: true, actionType, ticket });
  };

  const closeModal = () => setModalState(INITIAL_MODAL_STATE);

  const handleSubmit = async (formData) => {
    const { actionType, ticket } = modalState;
    const ticketId = getTicketId(ticket);

    if (!ticketId || !actionType) {
      toast.error('Unable to process ticket. Missing ticket details.');
      return;
    }

    setProcessingId(ticketId);
    let loadingToastId = null;

    try {
      loadingToastId = toast.loading(`${actionType} in progress...`);

      await updateTicket({
        endpoint: config.endpoints.tickets.update(ticketId),
        body: {
          status: actionType === 'Approve' ? 'APPROVED' : 'REJECTED',
          resolutionNotes: formData?.remarks || '',
        },
      });

      toast.dismiss(loadingToastId);
      toast.success(`Ticket ${actionType.toLowerCase()}d successfully!`);
      refetch();
      closeModal();
    } catch (submitError) {
      if (loadingToastId) toast.dismiss(loadingToastId);
      console.error(`Error ${actionType}ing ticket:`, submitError);
      toast.error(submitError?.message || 'An error occurred. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const getActionMenuOptions = (ticket) => [
    {
      label: 'Approve',
      icon: Check,
      iconClassName: 'text-green-600',
      onClick: () => openModal('Approve', ticket),
    },
    {
      label: 'Reject',
      icon: X,
      iconClassName: 'text-red-600',
      onClick: () => openModal('Reject', ticket),
    },
  ];

  const renderCell = (ticket, columnKey) => {
    switch (columnKey) {
      case 'ticketNumber':
        return <span className="font-medium text-[var(--theme-main)]">{ticket.ticketNumber}</span>;
      case 'description':
        return <span className="text-gray-900 max-w-xs truncate block">{ticket.description || '-'}</span>;
      case 'ticketType':
        return <span className="text-gray-700">{ticket.ticketType?.replace('_', ' ')}</span>;
      case 'priority':
        return <StatusChip value={ticket.priority} colorFn={getPriorityChipColor} />;
      case 'status':
        return <StatusChip value={ticket.status} />;
      case 'requester':
        return <span className="text-gray-700">{getRequesterName(ticket)}</span>;
      case 'createdAt':
        return <span className="text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>;
      case 'actions':
        return (
          <ActionMenu
            menuOptions={getActionMenuOptions(ticket)}
            disabled={processingId === getTicketId(ticket)}
          />
        );
      default:
        return ticket[columnKey];
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (isLoading && currentPage === 1) return <StateHandler loading={true} />;
  if (isError) return <StateHandler error={error?.message || 'Failed to load pending approval tickets'} />;

  return (
    <div>
      <FormModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        componentName={modalState.ticket?.ticketNumber || ''}
        actionType={modalState.actionType || ''}
        fields={modalState.actionType ? getTicketActionFields(modalState.actionType) : []}
        onSubmit={handleSubmit}
        size="medium"
        isSubmitting={isSubmitting}
        componentData={modalState.ticket}
        helpText={modalState.ticket?.description || ''}
        validationSchema={ticketApprovalValidationSchema}
      />

      <TableWrapper
        data={tickets}
        columns={columns}
        margin="m-0"
        shadow="shadow-none"
        title={
          <div className="flex items-center gap-2">
            Tickets for Approval
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Total - {paginationData?.totalCount || tickets.length}
            </span>
          </div>
        }
        renderCell={renderCell}
        showPagination={true}
        itemsPerPage={pageSize}
        ariaLabel="Tickets for approval table"
        isLoading={isLoading}
        serverPagination={true}
        paginationData={paginationData}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
