'use client';

import DetailsPage from '@/components/molecules/DetailsPage';
import { ticketDetailsData } from '@/dummyJson/dummyJson';

export default function TicketDetails({ ticketId, onBack }) {
  const ticketDetails = ticketDetailsData[ticketId];

  if (!ticketDetails) {
    return (
      <div className="p-6">
        <p>Ticket not found</p>
      </div>
    );
  }

  // Left column sections (30%) - Smaller information cards
  const leftSections = [
    {
      title: 'DETAILS',
      itemsGrid: true,
      items: [
        { label: 'Ticket ID', value: ticketDetails.ticketId },
        { label: 'Campus', value: ticketDetails.campus || '—' },
        { label: 'Raised On', value: ticketDetails.raisedOn || '—' },
        { label: 'Ticket Type', value: ticketDetails.type },
        { label: 'Assigned To', value: ticketDetails.assignedTo || '—' },
      ],
    },
    {
      title: 'STATUS TIMELINE',
      timeline: ticketDetails.timeline,
    },
    {
      title: 'DEVICE SUMMARY',
      items: [
        { label: 'Asset', value: ticketDetails.deviceSummary.asset },
        { label: 'Brand', value: ticketDetails.deviceSummary.brand },
        { label: 'Current Location', value: ticketDetails.deviceSummary.currentLocation },
        { 
          label: 'Condition', 
          value: ticketDetails.deviceSummary.condition, 
          className: ticketDetails.deviceSummary.condition === 'NOT WORKING' 
            ? 'text-red-600 font-semibold' 
            : 'text-green-600 font-semibold'
        },
      ],
    },
  ];

  // Right column sections (70%) - Larger content cards
  const rightSections = [
    {
      title: 'RESOLUTION NOTES',
      content: (
        <div className="text-sm text-gray-700">{ticketDetails.resolutionNotes || '—'}</div>
      ),
    },
    {
      title: 'HISTORY LOG',
      logEntries: ticketDetails.logEntries,
    },
    {
      title: 'ACTIONS',
      actions: [
        { label: 'Add Update', variant: 'default', onClick: () => console.log('Add Update') },
        { label: 'Escalate', variant: 'danger', onClick: () => console.log('Escalate') },
        { label: 'Resolve', variant: 'success', onClick: () => console.log('Resolve') },
        ...(ticketDetails.status === 'RESOLVED' ? [
          { label: 'Close Ticket', variant: 'primary', onClick: () => console.log('Close') }
        ] : []),
      ],
    },
  ];

  const getSlaColor = () => {
    if (ticketDetails.slaStatus === 'critical') return 'text-red-600';
    if (ticketDetails.slaStatus === 'warning') return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <DetailsPage
      title={`Ticket: ${ticketDetails.ticketId}`}
      subtitle={`SLA COUNTDOWN: ${ticketDetails.sla} Remaining (${ticketDetails.slaStatus.toUpperCase()})`}
      subtitleColor={getSlaColor()}
      leftSections={leftSections}
      rightSections={rightSections}
      onBack={onBack}
    />
  );
}
