"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setSelectedTicket } from '@/app/store/slices/ticketSlice';
import DetailsPage from '@/components/molecules/DetailsPage';
import Modal from '@/components/molecules/Modal';
import GenericForm from '@/components/molecules/GenericForm';
import StateHandler from '@/components/atoms/StateHandler';
import SLAIndicator from '@/components/molecules/SLAIndicator';
import CustomButton from '@/components/atoms/CustomButton';
import post from '@/app/api/post/post';
import config from '@/app/config/env.config';
import { toast } from '@/app/utils/toast';
import {
  ticketUpdateFormFields,
  ticketUpdateValidationSchema,
} from '@/app/config/formConfigs/ticketUpdateFormConfig';

export default function TicketDetails({ ticketId, ticketData, onBack, isLoading, isError, error }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <StateHandler
        isLoading={true}
        loadingMessage="Loading ticket details..."
      />
    );
  }

  if (isError) {
    return (
      <StateHandler
        isError={true}
        error={error}
        errorMessage="Error loading ticket details"
      />
    );
  }

  if (!ticketData) {
    return (
      <StateHandler
        isLoading={false}
        isError={false}
        isEmpty={true}
        emptyMessage="Ticket not found"
      />
    );
  }

  const ticket = ticketData;

  const historyEntries = (ticket.historyLogs || []).map((log) => ({
    time: log.createdAt ? new Date(log.createdAt).toLocaleString() : '—',
    text: `${log.action || log.actionType || 'Update'}${log.notes ? `: ${log.notes}` : ''}${log.newValue ? ` → ${log.newValue}` : ''}`,
  }));

  const handleUpdateClick = () => {
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (values, overrideStatus = null) => {
    setIsSubmitting(true);
    try {
      const payload = {};
      const apiFields = ['status', 'assigneeUserId', 'timelineDate', 'resolutionNotes', 'description'];
      apiFields.forEach((key) => {
        const val = key === 'status' && overrideStatus ? overrideStatus : values[key];
        if (val !== '' && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });

      if (Object.keys(payload).length === 0) {
        toast.warning('Please update at least one field.');
        setIsSubmitting(false);
        return;
      }

      await post({
        url: config.getApiUrl(config.endpoints.tickets.update(ticketId)),
        method: 'PUT',
        data: payload,
      });

      toast.success('Ticket updated successfully!');
      setIsUpdateModalOpen(false);

    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error(error?.message || 'Failed to update ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleResolvedClick = (values) => {
    handleUpdateSubmit(values, 'RESOLVED');
  };

  const handleEscalationClick = (values) => {
    handleUpdateSubmit(values, 'ESCALATED');
  };

  const updateInitialValues = {
    status: ticket.status || '',
    assigneeUserId: ticket.assigneeUserId || '',
    description: ticket.description || '',
    resolutionNotes: ticket.resolutionNotes || '',
    timelineDate: ticket.timelineDate || '',
  };

  const updateFormFieldsModified = ticketUpdateFormFields.map(field => {
    if (field.name === 'assigneeUserId') {
      if (ticket.assigneeUser) {
        return {
          ...field,
          selectedItem: {
            ...ticket.assigneeUser,
            id: ticket.assigneeUser?.id || ticket.assigneeUserId,
          },
        };
      }
      return {
        ...field,
        type: 'text',
        placeholder: ticket.assigneeUserId || 'Not assigned',
      };
    }
    if (field.name === 'timelineDate' && ticket.timelineDate) {
      return {
        ...field,
        disabled: true,
        helperText: 'SLA timeline is already set and cannot be changed.',
      };
    }
    return field;
  });

  const leftSections = [
    {
      title: 'SLA / TIMELINE',
      content: (
        <SLAIndicator 
          allocationDate={ticket.assignDate}
          expectedResolutionDate={ticket.timelineDate}
          status={ticket.status}
          compact={false}
        />
      ),
    },
    {
      title: 'DESCRIPTION',
      content: <div className="text-sm text-gray-700">{ticket.description || '—'}</div>,
    },
    {
      title: 'RESOLUTION NOTES',
      content: <div className="text-sm text-gray-700">{ticket.resolutionNotes || '—'}</div>,
    },
    {
      title: 'HISTORY LOG',
      ...(historyEntries.length
        ? { logEntries: historyEntries }
        : { content: <div className="text-sm text-gray-600">No history for this ticket.</div> }),
    },
    ...(ticket.status === 'APPROVED' ? [{
      title: 'ACTIONS',
      actions: [
        { label: 'Update Ticket', variant: 'primary', onClick: handleUpdateClick },
      ],
    }] : []),
  ];

  const rightSections = [
    {
      title: 'DETAILS',
      itemsGrid: true,
      items: [
        { label: 'Ticket ID', value: ticket.id || '—' },
        { label: 'Ticket Number', value: ticket.ticketNumber || '—' },
        { label: 'Ticket Type', value: ticket.ticketType || '—' },
        { label: 'Priority', value: ticket.priority || '—' },
        { label: 'Status', value: ticket.status || '—' },
        { label: 'Is Escalated', value: ticket.isEscalated ? 'Yes' : 'No' },
        { label: 'Address', value: ticket.address || '—' },
        { label: 'Manager Email', value: ticket.managerEmail || '—' },
        { label: 'Campus', value: ticket.campus?.name || ticket.campusId || '—' },
        { label: 'Campus ID', value: ticket.campus?.id || ticket.campusId || '—' },
        { label: 'Campus Code', value: ticket.campus?.code || '—' },
        { label: 'Campus Name', value: ticket.campus?.name || '—' },
        { label: 'Raised On', value: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—' },
        { label: 'Last Updated On', value: ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '—' },
        { label: 'Resolved On', value: ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : '—' },
        { label: 'Closed On', value: ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : '—' },
        { label: 'Assignment Date', value: ticket.assignDate ? new Date(ticket.assignDate).toLocaleString() : '—' },
        { label: 'Timeline Date', value: ticket.timelineDate ? new Date(ticket.timelineDate).toLocaleString() : '—' },

        { label: 'Raised By', value: ticket.raisedByUser ? `${ticket.raisedByUser.firstName} ${ticket.raisedByUser.lastName}`.trim() : '—' },
        // { label: 'Raised By User ID', value: ticket.raisedByUserId || ticket.raisedByUser?.id || '—' },
        { label: 'Raised By Username', value: ticket.raisedByUser?.username || '—' },
        { label: 'Raised By Role', value: ticket.raisedByUser?.role || '—' },
        { label: 'Raised By Email', value: ticket.raisedByUser?.email || '—' },

        { label: 'Assigned To', value: ticket.assigneeUser ? `${ticket.assigneeUser.firstName} ${ticket.assigneeUser.lastName}`.trim() : (ticket.assigneeName || '—') },
        { label: 'Assignee ID', value: ticket.assigneeUserId || '—' },
        { label: 'Assignee User ID', value: ticket.assigneeUser?.id || '—' },
        { label: 'Assignee Username', value: ticket.assigneeUser?.username || '—' },
        { label: 'Assignee Role', value: ticket.assigneeUser?.role || '—' },
        { label: 'Assignee Email', value: ticket.assigneeUser?.email || '—' },
        // { label: 'Last Updated By User ID', value: ticket.lastUpdatedByUserId || '—' },
      ],
    },
    {
      title: 'DEVICE SUMMARY',
      items: [
        { label: 'Asset ID', value: ticket.assetId || '—' },
        { label: 'Asset', value: ticket.asset?.assetTag || ticket.assetId || '—' },
        { label: 'Brand', value: ticket.asset?.brand || '—' },
        { label: 'Current Location', value: ticket.asset?.location?.name || '—' },
        { label: 'Condition', value: ticket.asset?.condition || '—' },
      ],
    },
  ];

  const handleCreateAllocation = () => {
    dispatch(setSelectedTicket({ ...ticket, id: ticket?.id || ticketId }));
    router.push(`/allocations/create?ticketId=${ticket?.id || ticketId}`);
  }

  return (
    <>
      <DetailsPage
        title={`Ticket: ${ticket.ticketNumber || ticket.id}`}
        subtitle={`Created: ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'}`}
        leftSections={leftSections}
        rightSections={rightSections}
        onBack={onBack}
        headerActions={
          ticket.status === 'APPROVED' ? (
            <CustomButton
              text="Create Allocation"
              variant="primary"
              size="md"
              onClick={handleCreateAllocation}
            />
          ) : ticket.status === 'RAISED' ? (
            <CustomButton
              text="Ticket is not approved"
              variant="warning"
              size="md"
              className="border-orange-500 text-orange-500 bg-orange-50 hover:bg-orange-100 cursor-default"
              onClick={() => {}}
              title="Please contact your manager"
            />
          ) : null}
      />

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseModal}
        title="Update Ticket"
        size="medium"
      >
        {ticket.assigneeUser && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-medium">Currently Assigned To:</span> {ticket.assigneeUser.firstName} {ticket.assigneeUser.lastName}
            </p>
          </div>
        )}
        <GenericForm
          fields={updateFormFieldsModified}
          initialValues={updateInitialValues}
          validationSchema={ticketUpdateValidationSchema}
          onSubmit={handleUpdateSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
          submitButtonText="Update Ticket"
          cancelButtonText="Cancel"
          customActions={[
            { label: isSubmitting ? 'Processing...' : 'Resolved', variant: 'success', onClick: handleResolvedClick, disabled: isSubmitting },
            { label: isSubmitting ? 'Processing...' : 'Escalation', variant: 'warning', onClick: handleEscalationClick, disabled: isSubmitting },
          ]}
        />
      </Modal>
    </>
  );
}
