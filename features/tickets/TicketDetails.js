"use client";

import React from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import useFetch from '@/app/hooks/query/useFetch';

export default function TicketDetails({ ticketId, onBack }) {
  const { data, isLoading, isError } = useFetch({
    url: `https://asset-dashboard.navgurukul.org/api/tickets/${ticketId}`,
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
      logEntries: ticket.logEntries || [],
    },
  ];

  return (
    <DetailsPage
      title={`Ticket: ${ticket.ticketNumber || ticket.id}`}
      subtitle={`Created: ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'}`}
      leftSections={leftSections}
      rightSections={rightSections}
      onBack={onBack}
    />
  );
}
