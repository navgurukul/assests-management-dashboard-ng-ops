'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TableWrapper from '@/components/Table/TableWrapper';
import { ticketsTableData, ticketDetailsData } from '@/dummyJson/dummyJson';

const columns = [
  { key: "ticketId", label: "TICKET ID" },
  { key: "type", label: "TYPE" },
  { key: "device", label: "DEVICE" },
  { key: "status", label: "STATUS" },
  { key: "updated", label: "UPDATED" },
];

export default function TicketsList() {
  const router = useRouter();

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
      default:
        return cellValue;
    }
  };

  const handleRowClick = (ticket) => {
    router.push(`/tickets/${ticket.id}?id=${ticket.id}`);
  };

  return (
    <TableWrapper
      data={ticketsTableData}
      columns={columns}
      title="Tickets"
      renderCell={renderCell}
      itemsPerPage={10}
      showPagination={true}
      ariaLabel="Tickets table"
      onRowClick={handleRowClick}
    />
  );
}
