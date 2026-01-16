'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TableWrapper from '@/components/Table/TableWrapper';
import SLAIndicator from '@/components/molecules/SLAIndicator';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { ticketDetailsData } from '@/dummyJson/dummyJson';

const columns = [
  { key: "ticketId", label: "TICKET ID" },
  { key: "type", label: "TYPE" },
  { key: "device", label: "DEVICE" },
  { key: "status", label: "STATUS" },
  { key: "sla", label: "SLA" },
  { key: "actionTakenBy", label: "ACTION TAKEN BY" },
  { key: "updated", label: "UPDATED" },
];

export default function TicketsList() {
  const router = useRouter();

  const { data, isLoading, isError } = useFetch({
    url: config.getApiUrl('/all-tickets'),
    queryKey: ['all-tickets'],
  });

  const ticketsData = React.useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((ticket) => {
      const deviceTag = ticket.asset?.assetTag || ticket.assetTag || ticket.assetId || '-';
      const updatedLabel = ticket.updatedAt
        ? new Date(ticket.updatedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—';

      // Get action taken by from lastUpdatedByUser
      const actionTakenBy = ticket.lastUpdatedByUser 
        ? `${ticket.lastUpdatedByUser.role || ''}`.trim() || ticket.lastUpdatedByUser.email || ''
        : ticket.assigneeName || ticket.assignee || '—';

      return {
        id: ticket.id,
        ticketId: ticket.ticketNumber || ticket.id || '-',
        type: ticket.ticketType || '-',
        device: deviceTag,
        status: ticket.status || '-',
        sla: {
          allocationDate: ticket.assignDate,
          expectedResolutionDate: ticket.timelineDate,
          status: ticket.status,
        },
        actionTakenBy,
        updated: updatedLabel,
      };
    });
  }, [data]);

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "ticketId":
        return <span className="font-medium text-gray-800">{cellValue}</span>;
      case "device":
        // Derive device from details data when available
        const details = ticketDetailsData[item.id];
        const deviceTag = details?.deviceSummary?.asset || '-';
        return <span className="text-gray-700">{deviceTag}</span>;
      case "status":
        const statusColors = {
          'OPEN': 'bg-green-100 text-green-800',
          'ALLOCATED': 'bg-blue-100 text-blue-800',
          'IN_PROGRESS': 'bg-cyan-100 text-cyan-800',
          'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-800',
          'OVERDUE': 'bg-red-100 text-red-800',
          'RESOLVED': 'bg-purple-100 text-purple-800',
          'CLOSED': 'bg-gray-100 text-gray-800',
          'ESCALATED': 'bg-orange-100 text-orange-800',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      case "sla":
        return (
          <SLAIndicator 
            allocationDate={cellValue.allocationDate}
            expectedResolutionDate={cellValue.expectedResolutionDate}
            status={cellValue.status}
            compact={true}
          />
        );
      case "updated":
        return <span className="text-gray-500 text-sm">{cellValue || '—'}</span>;
      case "actionTakenBy":
        return <span className="text-gray-700 text-sm">{cellValue || '—'}</span>;
      default:
        return cellValue;
    }
  };

  const handleRowClick = (ticket) => {
    router.push(`/tickets/${ticket.id}?id=${ticket.id}`);
  };

  const handleCreateClick = () => {
    router.push('/tickets/create');
  };

  if (isLoading) {
    return <div className="p-6">Loading tickets...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-600">Failed to load tickets.</div>;
  }

  return (
    <TableWrapper
      data={ticketsData}
      columns={columns}
      title="Tickets"
      renderCell={renderCell}
      itemsPerPage={10}
      showPagination={true}
      ariaLabel="Tickets table"
      onRowClick={handleRowClick}
      showCreateButton={true}
      onCreateClick={handleCreateClick}
    />
  );
}
