'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TableWrapper from '@/components/Table/TableWrapper';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { ticketDetailsData } from '@/dummyJson/dummyJson';

const columns = [
  { key: "ticketId", label: "TICKET ID" },
  { key: "type", label: "TYPE" },
  { key: "device", label: "DEVICE" },
  { key: "status", label: "STATUS" },
  { key: "actionTakenBy", label: "ACTION TAKEN BY" },
  { key: "updated", label: "UPDATED" },
];

const actionTakenByOptions = [
  'IT coordinator',
  'Operation associate',
  'Teach lead',
  'Repairing team/company',
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

      return {
        id: ticket.id,
        ticketId: ticket.ticketNumber || ticket.id || '-',
        type: ticket.ticketType || '-',
        device: deviceTag,
        status: ticket.status || '-',
        actionTakenBy: ticket.assigneeName || ticket.assignee || '',
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
          'IN PROGRESS': 'bg-blue-100 text-blue-800',
          'ESCALATED': 'bg-red-100 text-red-800',
          'OPEN': 'bg-green-100 text-green-800',
          'PENDING APPROVAL': 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      case "updated":
        return <span className="text-gray-500 text-sm">{cellValue || '—'}</span>;
      case "actionTakenBy":
        return (
          <select
            className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={cellValue || ''}
            onChange={(e) => {
              e.stopPropagation();
              console.log(`Updated ticket ${item.id} action taken by:`, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Select...</option>
            {actionTakenByOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
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
