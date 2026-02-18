'use client';

import { Ticket, Check, X, MoreVertical } from 'lucide-react';
import { useState, useCallback } from 'react';
import CustomButton from '@/components/atoms/CustomButton';
import TableWrapper from '@/components/Table/TableWrapper';
import ActionMenu from '@/components/molecules/ActionMenu';
import FormModal from '@/components/molecules/FormModal';
import { toast } from '@/app/utils/toast';
import { useAuth } from '@/app/context/AuthContext';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import StateHandler from '@/components/atoms/StateHandler';



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
  const { user } = useAuth();
  const [processingTicket, setProcessingTicket] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Build query string with pagination
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', pageSize);
    return params.toString();
  };
  
  // Fetch pending approval tickets from API
  // TODO: Replace hardcoded email with user?.email when ready
  const managerEmail = 'sarah.johnson@company.com';
  const { data, isLoading, isError, error, refetch } = useFetch({
    url: `${config.endpoints.tickets.pendingApproval}/${encodeURIComponent(managerEmail)}?${buildQueryString()}`,
    queryKey: ['pending-approval-tickets', managerEmail, currentPage, pageSize],
    enabled: true,
  });
  
  // Extract tickets from API response
  const ticketsToDisplay = data?.data?.tickets || [];
  const paginationData = data?.data?.pagination || null;

  // Handle opening the action modal
  const handleOpenActionModal = useCallback((actionType, ticket) => {
    setCurrentAction(actionType);
    setCurrentTicket(ticket);
    setIsModalOpen(true);
    setOpenMenuId(null); // Close the action menu
  }, []);

  // Handle closing the modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentAction(null);
    setCurrentTicket(null);
    setIsSubmitting(false);
  }, []);

  // Handle form submission
  const handleFormSubmit = useCallback(async (formData) => {
    setIsSubmitting(true);
    let loadingToastId = null;

    try {
      const action = currentAction?.toLowerCase();
      loadingToastId = toast.loading(`${currentAction} in progress...`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would make the actual API call
      // const payload = {
      //   ticketId: currentTicket.id,
      //   action: action,
      //   remarks: formData.remarks || ''
      // };
      // await post({ url: apiUrl, method: 'POST', data: payload });
      
      toast.dismiss(loadingToastId);
      loadingToastId = null;
      toast.success(`Ticket ${action}d successfully!`);
      
      // Refetch the pending approval tickets
      refetch();
      
      handleCloseModal();
      
    } catch (error) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      console.error(`Error ${currentAction}ing ticket:`, error);
      const errorMessage = error?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentAction, currentTicket, handleCloseModal, refetch]);

  // Handle cell rendering
  const renderCell = useCallback((ticket, columnKey) => {
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
            {ticket.raisedByUser 
              ? `${ticket.raisedByUser.firstName} ${ticket.raisedByUser.lastName}` 
              : ticket.requesterUser 
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
        const menuOptions = [
          {
            label: 'Approve',
            icon: Check,
            iconClassName: 'text-green-600',
            onClick: () => handleOpenActionModal('Approve', ticket)
          },
          {
            label: 'Reject',
            icon: X,
            iconClassName: 'text-red-600',
            onClick: () => handleOpenActionModal('Reject', ticket)
          }
        ];

        return (
          <div className="relative flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === ticket.id ? null : ticket.id);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Actions menu"
              disabled={processingTicket === ticket.id}
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
            {openMenuId === ticket.id && (
              <ActionMenu
                menuOptions={menuOptions}
                onClose={() => setOpenMenuId(null)}
              />
            )}
          </div>
        );
      
      default:
        return ticket[columnKey];
    }
  }, [openMenuId, processingTicket, handleOpenActionModal]);

  // Define form fields based on action
  const getFormFields = () => {
    if (!currentAction) return [];
    
    return [
      {
        name: 'remarks',
        label: 'Remarks',
        type: 'textarea',
        placeholder: `Enter remarks for ${currentAction.toLowerCase()}ing this ticket...`,
        required: false,
        rows: 4
      }
    ];
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  
  // Loading state
  if (isLoading && currentPage === 1) {
    return <StateHandler loading={true} />;
  }
  
  // Error state
  if (isError) {
    return <StateHandler error={error?.message || 'Failed to load pending approval tickets'} />;
  }

  return (
    <div>
      {/* Action Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        componentName={currentTicket?.ticketNumber || ''}
        actionType={currentAction || ''}
        fields={getFormFields()}
        onSubmit={handleFormSubmit}
        size="medium"
        isSubmitting={isSubmitting}
        componentData={currentTicket}
        helpText={currentTicket?.description || ''}
      />

      {/* Table */}
      <TableWrapper
        key={`table-${openMenuId || 'none'}`}
        data={ticketsToDisplay}
        columns={columns}
        title={
          <div className="flex items-center gap-2">
            Tickets for Approval
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              {paginationData?.totalCount || ticketsToDisplay.length} pending
            </span>
          </div>
        }
        renderCell={renderCell}
        showPagination={true}
        itemsPerPage={pageSize}
        ariaLabel="Tickets for approval table"
        isLoading={isLoading}
        // Server-side pagination props
        serverPagination={true}
        paginationData={paginationData}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
