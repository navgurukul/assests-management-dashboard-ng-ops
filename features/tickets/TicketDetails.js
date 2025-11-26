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

  const infoSections = [
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

  const actions = [
    { label: 'Add Update', variant: 'default', onClick: () => console.log('Add Update') },
    { label: 'Escalate', variant: 'danger', onClick: () => console.log('Escalate') },
    { label: 'Resolve', variant: 'success', onClick: () => console.log('Resolve') },
    { label: 'Close Ticket', variant: 'primary', onClick: () => console.log('Close') },
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
      timeline={ticketDetails.timeline}
      infoSections={infoSections}
      logEntries={ticketDetails.logEntries}
      logTitle="NOTES / UPDATES LOG (editable thread)"
      actions={actions}
      showTimeline={true}
      showInfoSections={true}
      showLog={true}
      showActions={true}
      onBack={onBack}
    />
  );
}
