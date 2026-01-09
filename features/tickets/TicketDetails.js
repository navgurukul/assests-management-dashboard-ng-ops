"use client";

import React, { useState } from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import Modal from '@/components/molecules/Modal';
import GenericForm from '@/components/molecules/GenericForm';
import useFetch from '@/app/hooks/query/useFetch';
import post from '@/app/api/post/post';
import config from '@/app/config/env.config';
import {
  ticketUpdateFormFields,
  ticketUpdateValidationSchema,
} from '@/app/config/formConfigs/ticketUpdateFormConfig';

export default function TicketDetails({ ticketId, onBack }) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError, refetch } = useFetch({
    url: config.getApiUrl(config.endpoints.tickets.details(ticketId)),
    queryKey: ['ticket', ticketId],
  });

  if (isLoading) {
    return <div className="p-6">Loading ticket...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6">
        <p>Ticket not found</p>
      </div>
    );
  }

  const ticket = data.data;
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

      console.log('Ticket updated successfully:', result);
      alert('Ticket updated successfully!');
      
      setIsUpdateModalOpen(false);
      refetch(); // Refresh ticket data
      
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

  const updateInitialValues = {
    status: ticket.status || '',
    assigneeUserId: ticket.assigneeUserId || '',
    description: ticket.description || '',
    resolutionNotes: ticket.resolutionNotes || '',
  };

  const leftSections = [
    {
      title: 'DETAILS',
      itemsGrid: true,
      items: [
        { label: 'Ticket Number', value: ticket.ticketNumber || '—' },
        { label: 'Campus', value: ticket.campus?.name || ticket.campusId || '—' },
        { label: 'Raised On', value: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—' },
        { label: 'Ticket Type', value: ticket.ticketType || '—' },
        { label: 'Assigned To', value: ticket.assigneeName || ticket.assigneeUserId || '—' },
        { label: 'Priority', value: ticket.priority || '—' },
        { label: 'Status', value: ticket.status || '—' },
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

  const rightSections = [
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

  return (
    <>
      <DetailsPage
        title={`Ticket: ${ticket.ticketNumber || ticket.id}`}
        subtitle={`Created: ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'}`}
        leftSections={leftSections}
        rightSections={rightSections}
        onBack={onBack}
      />

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseModal}
        title="Update Ticket"
        size="medium"
      >
        <GenericForm
          fields={ticketUpdateFormFields}
          initialValues={updateInitialValues}
          validationSchema={ticketUpdateValidationSchema}
          onSubmit={handleUpdateSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
          submitButtonText="Update Ticket"
          cancelButtonText="Cancel"
        />
      </Modal>
    </>
  );
}
