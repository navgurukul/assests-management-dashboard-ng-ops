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
import {
  ticketUpdateFormFields,
  ticketUpdateValidationSchema,
} from '@/app/config/formConfigs/ticketUpdateFormConfig';

export default function TicketDetails({ ticketId, ticketData, onBack }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use table row data directly — no API call needed
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

  const handleUpdateSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Filter out empty values
      const payload = Object.keys(values).reduce((acc, key) => {
        if (values[key] !== '' && values[key] !== null && values[key] !== undefined) {
          acc[key] = values[key];
        }
        return acc;
      }, {});

      if (Object.keys(payload).length === 0) {
        alert('Please update at least one field');
        setIsSubmitting(false);
        return;
      }

      const result = await post({
        url: config.getApiUrl(config.endpoints.tickets.update(ticketId)),
        method: 'PUT',
        data: payload,
      });

      alert('Ticket updated successfully!');
      
      setIsUpdateModalOpen(false);
      
    } catch (error) {
      console.error('Error updating ticket:', error);
      const errorMessage = error?.message || 'Failed to update ticket';
      alert(`${errorMessage}\n\nPlease try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleResolvedClick = (values) => {
    // No action needed
  };

  const handleEscalationClick = (values) => {
    // No action needed
  };

  const updateInitialValues = {
    status: ticket.status || '',
    assigneeUserId: ticket.assigneeUserId || '',
    description: ticket.description || '',
    resolutionNotes: ticket.resolutionNotes || '',
    timelineDate: ticket.timelineDate || '',
  };

  // Prevent status change if already allocated/assigned
  const isAllocated = !!ticket.assigneeUserId;

  const updateFormFieldsModified = ticketUpdateFormFields.map(field => {
    if (field.name === 'status' && isAllocated) {
      return {
        ...field,
        disabled: true,
        helperText: 'Status cannot be changed after allocation.',
      };
    }
    if (field.name === 'timelineDate' && ticket.timelineDate) {
      return {
        ...field,
        disabled: true,
        helperText: 'SLA timeline is already set and cannot be changed.',
      };
    }
    if (field.name === 'assigneeUserId' && ticket.assigneeUser) {
      // Pre-load the selected coordinator to display immediately
      // Ensure the selectedItem has an 'id' field so React Aria can key it correctly
      return {
        ...field,
        selectedItem: {
          ...ticket.assigneeUser,
          id: ticket.assigneeUser?.id || ticket.assigneeUserId,
        },
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
    {
      title: 'ACTIONS',
      actions: [
        { label: 'Update Ticket', variant: 'primary', onClick: handleUpdateClick },
      ],
    },
  ];

  const rightSections = [
    {
      title: 'DETAILS',
      itemsGrid: true,
      items: [
        { label: 'Ticket ID', value: ticket.id || '—' },
        { label: 'Ticket Number', value: ticket.ticketNumber || '—' },
        { label: 'Campus', value: ticket.campus?.name || ticket.campusId || '—' },
        { label: 'Address', value: ticket.address || '—' },
        { label: 'Manager Email', value: ticket.managerEmail || '—' },
        { label: 'Raised On', value: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—' },
        { label: 'Raised By', value: ticket.raisedByUser ? `${ticket.raisedByUser.firstName} ${ticket.raisedByUser.lastName}`.trim() : '—' },
        { label: 'Raised By Email', value: ticket.raisedByUser?.email || '—' },
        { label: 'Ticket Type', value: ticket.ticketType || '—' },
        { label: 'Assigned To', value: ticket.assigneeUser ? `${ticket.assigneeUser.firstName} ${ticket.assigneeUser.lastName}`.trim() : (ticket.assigneeName || ticket.assigneeUserId || '—') },
        { label: 'Assignee Email', value: ticket.assigneeUser?.email || '—' },
        { label: 'Priority', value: ticket.priority || '—' },
        { label: 'Status', value: ticket.status || '—' },
        { label: 'Assignment Date', value: ticket.assignDate ? new Date(ticket.assignDate).toLocaleDateString() : '—' },
        { label: 'Timeline Date', value: ticket.timelineDate ? new Date(ticket.timelineDate).toLocaleDateString() + (ticket.timelineDate ? ' 🔒' : '') : '—' },
      ],
    },
    {
      title: 'DEVICE SUMMARY',
      items: [
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
          <CustomButton
            text="Create Allocation"
            variant="primary"
            size="md"
            onClick={handleCreateAllocation}
          />
        }
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
          cancelButtonText="Cancel"
          customActions={[
            { label: 'Resolved', variant: 'success', onClick: handleResolvedClick },
            { label: 'Escalation', variant: 'warning', onClick: handleEscalationClick },
          ]}
        />
      </Modal>
    </>
  );
}
