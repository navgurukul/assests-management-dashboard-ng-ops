'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TableWrapper from '@/components/Table/TableWrapper';
import SLAIndicator from '@/components/molecules/SLAIndicator';
import SearchInput from '@/components/molecules/SearchInput';
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input (800ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to first page when search changes
    }, 800);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build query string with pagination and search
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    // Add search parameter first
    if (debouncedSearch) params.append('search', debouncedSearch);
    
    params.append('page', currentPage);
    params.append('limit', pageSize);
    return params.toString();
  };

  // Fetch tickets data from API with pagination and search
  const { data, isLoading, isError } = useFetch({
    url: `/tickets?${buildQueryString()}`,
    queryKey: ['tickets', currentPage, pageSize, debouncedSearch],
  });

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const ticketsData = React.useMemo(() => {
    if (!data?.data?.tickets) return [];

    return data.data.tickets.map((ticket) => {
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading tickets</p>
          <p className="text-gray-600 mt-2">Something went wrong</p>
        </div>
      </div>
    );
  }

  return (
    <TableWrapper
      data={ticketsData}
      columns={columns}
      title="Tickets"
      renderCell={renderCell}
      itemsPerPage={pageSize}
      showPagination={true}
      ariaLabel="Tickets table"
      onRowClick={handleRowClick}
      showCreateButton={true}
      onCreateClick={handleCreateClick}
      // Search component
      searchComponent={
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search tickets..."
        />
      }
      // Server-side pagination props
      serverPagination={true}
      paginationData={data?.data?.pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
