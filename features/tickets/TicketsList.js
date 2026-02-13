'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import SummaryCard from '@/components/atoms/SummaryCard';
import SLAIndicator from '@/components/molecules/SLAIndicator';
import SearchInput from '@/components/molecules/SearchInput';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { ticketDetailsData, ticketsSummaryCards } from '@/dummyJson/dummyJson';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import {
  TICKET_TABLE_ID,
  ticketTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/ticketTableConfig';

export default function TicketsList() {
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filter state
  const [filters, setFilters] = useState({});

  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Column visibility management
  const {
    visibleColumns,
    visibleColumnKeys,
    allColumns,
    toggleColumn,
    showAllColumns,
    resetToDefault,
    alwaysVisibleColumns,
  } = useTableColumns(TICKET_TABLE_ID, ticketTableColumns, defaultVisibleColumns);

  // Debounce search input (800ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to first page when search changes
    }, 800);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build query string with pagination, filters, and search
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    // Add search parameter first
    if (debouncedSearch) params.append('search', debouncedSearch);
    
    params.append('page', currentPage);
    params.append('limit', pageSize);

    // Add filters
    if (filters.campus) params.append('campusId', filters.campus);
    if (filters.status) params.append('status', filters.status);
    if (filters.assignee) params.append('assigneeId', filters.assignee);
    
    return params.toString();
  };

  // Fetch tickets data from API with pagination, filters, and search
  const { data, isLoading, isError } = useFetch({
    url: `/tickets?${buildQueryString()}`,
    queryKey: ['tickets', currentPage, pageSize, filters, debouncedSearch],
  });

  // Fetch counts for each status
  const { data: totalCountData } = useFetch({
    url: '/tickets?page=1&limit=1',
    queryKey: ['tickets-count-total'],
  });

  const { data: openCountData } = useFetch({
    url: '/tickets?status=OPEN&page=1&limit=1',
    queryKey: ['tickets-count-open'],
  });

  const { data: inProgressCountData } = useFetch({
    url: '/tickets?status=IN_PROGRESS&page=1&limit=1',
    queryKey: ['tickets-count-in-progress'],
  });

  const { data: resolvedCountData } = useFetch({
    url: '/tickets?status=RESOLVED&page=1&limit=1',
    queryKey: ['tickets-count-resolved'],
  });

  const { data: closedCountData } = useFetch({
    url: '/tickets?status=CLOSED&page=1&limit=1',
    queryKey: ['tickets-count-closed'],
  });

  const { data: rejectedCountData } = useFetch({
    url: '/tickets?status=REJECTED&page=1&limit=1',
    queryKey: ['tickets-count-rejected'],
  });

  // Fetch campus options from API
  const { data: campusData } = useFetch({
    url: '/campuses',
    queryKey: ['campuses'],
  });

  // Fetch users for assignee filter - COMMENTED OUT
  // const { data: usersData } = useFetch({
  //   url: '/users',
  //   queryKey: ['users'],
  // });

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle status card click
  const handleStatusCardClick = (status) => {
    if (status === null) {
      // Total card clicked - remove status filter
      const newFilters = { ...filters };
      delete newFilters.status;
      setFilters(newFilters);
    } else if (filters.status === status) {
      // If already filtered by this status, remove the filter
      const newFilters = { ...filters };
      delete newFilters.status;
      setFilters(newFilters);
    } else {
      // Apply the status filter
      setFilters({ ...filters, status });
    }
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle removing a single filter chip
  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Transform campus data from API to filter options
  const campusOptions = React.useMemo(() => {
    if (!campusData || !campusData.data) return [];
    
    return campusData.data.map((campus) => ({
      value: campus.id,
      label: campus.campusName,
    }));
  }, [campusData]);

  // Transform users data from API to assignee filter options
  const assigneeOptions = React.useMemo(() => {
    // Temporarily disabled - users API commented out
    return [];
    
    // if (!usersData || !usersData.data) return [];
    // 
    // return usersData.data.map((user) => ({
    //   value: user.id,
    //   label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    // }));
  }, []);

  // Status filter options based on API documentation
  const filterStatusOptions = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  // Get label for a filter value
  const getFilterLabel = (filterKey, value) => {
    if (filterKey === 'campus') {
      const campus = campusOptions.find(opt => opt.value === value);
      return campus ? campus.label : value;
    }
    if (filterKey === 'status') {
      const status = filterStatusOptions.find(opt => opt.value === value);
      return status ? status.label : value;
    }
    if (filterKey === 'assignee') {
      const assignee = assigneeOptions.find(opt => opt.value === value);
      return assignee ? assignee.label : value;
    }
    return value;
  };

  // Get category name for display
  const getCategoryName = (filterKey) => {
    const categoryNames = {
      campus: 'Campus',
      status: 'Status',
      assignee: 'Assigned To'
    };
    return categoryNames[filterKey] || filterKey;
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

      // Get created date
      const createdAtLabel = ticket.createdAt
        ? new Date(ticket.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—';

      // Get raised by user with email
      const raisedBy = ticket.raisedByUser
        ? {
            name: `${ticket.raisedByUser.firstName || ''} ${ticket.raisedByUser.lastName || ''}`.trim() || ticket.raisedByUser.email || '',
            email: ticket.raisedByUser.email || ''
          }
        : { name: '—', email: '' };

      // Get assigned to user with email
      const assignedTo = ticket.assigneeUser
        ? {
            name: `${ticket.assigneeUser.firstName || ''} ${ticket.assigneeUser.lastName || ''}`.trim() || ticket.assigneeUser.email || '',
            email: ticket.assigneeUser.email || ''
          }
        : { name: '—', email: '' };

      // Get emails
      const raisedByEmail = ticket.raisedByUser?.email || '—';
      const assigneeEmail = ticket.assigneeUser?.email || '—';

      // Get assign date
      const assignDateLabel = ticket.assignDate
        ? new Date(ticket.assignDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—';

      // Get resolved date
      const resolvedAtLabel = ticket.resolvedAt
        ? new Date(ticket.resolvedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—';

      // Get closed date
      const closedAtLabel = ticket.closedAt
        ? new Date(ticket.closedAt).toLocaleDateString('en-GB', {
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
        sla: {
          allocationDate: ticket.assignDate,
          expectedResolutionDate: ticket.timelineDate,
          status: ticket.status,
        },
        actionTakenBy,
        updated: updatedLabel,
        priority: ticket.priority || '-',
        campus: ticket.campus?.name || ticket.campus?.code || '-',
        raisedBy,
        assignedTo,
        raisedByEmail,
        assigneeEmail,
        createdAt: createdAtLabel,
        assignDate: assignDateLabel,
        resolvedAt: resolvedAtLabel,
        closedAt: closedAtLabel,
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
        const deviceTag = details?.deviceSummary?.asset || cellValue;
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
      case "priority":
        const priorityColors = {
          'LOW': 'bg-green-100 text-green-800',
          'MEDIUM': 'bg-yellow-100 text-yellow-800',
          'HIGH': 'bg-orange-100 text-orange-800',
          'CRITICAL': 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
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
      case "createdAt":
      case "assignDate":
      case "resolvedAt":
      case "closedAt":
        return <span className="text-gray-500 text-sm">{cellValue || '—'}</span>;
      case "raisedBy":
        return (
          <div className="flex flex-col">
            <span className="text-gray-700 text-sm font-medium">{cellValue?.name || '—'}</span>
            {cellValue?.email && (
              <span className="text-gray-500 text-xs">{cellValue.email}</span>
            )}
          </div>
        );
      case "assignedTo":
        return (
          <div className="flex flex-col">
            <span className="text-gray-700 text-sm font-medium">{cellValue?.name || '—'}</span>
            {cellValue?.email && (
              <span className="text-gray-500 text-xs">{cellValue.email}</span>
            )}
          </div>
        );
      case "actionTakenBy":
      case "raisedByEmail":
      case "assigneeEmail":
      case "campus":
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

  // Get count for a specific status
  const getStatusCount = (status) => {
    if (status === null) {
      return totalCountData?.data?.pagination?.totalCount || 0;
    }
    switch (status) {
      case 'OPEN':
        return openCountData?.data?.pagination?.totalCount || 0;
      case 'IN_PROGRESS':
        return inProgressCountData?.data?.pagination?.totalCount || 0;
      case 'RESOLVED':
        return resolvedCountData?.data?.pagination?.totalCount || 0;
      case 'CLOSED':
        return closedCountData?.data?.pagination?.totalCount || 0;
      case 'REJECTED':
        return rejectedCountData?.data?.pagination?.totalCount || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {ticketsSummaryCards.map((card) => {
          const IconComponent = LucideIcons[card.icon];
          const isActive = card.status === null 
            ? !filters.status 
            : filters.status === card.status;
          return (
            <SummaryCard
              key={card.id}
              label={card.label}
              value={getStatusCount(card.status)}
              Icon={IconComponent}
              valueColor={card.valueColor}
              iconColor={card.iconColor}
              borderColor={card.borderColor}
              clickable={true}
              onClick={() => handleStatusCardClick(card.status)}
              isActive={isActive}
            />
          );
        })}
      </div>

      {/* Table */}
      <TableWrapper
        data={ticketsData}
        columns={visibleColumns}
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
        // Filter component
        filterComponent={
          <FilterDropdown
            onFilterChange={handleFilterChange}
            campusOptions={campusOptions}
            statusOptions={filterStatusOptions}
            selectedFilters={filters}
          />
        }
        // Column selector component
        columnSelectorComponent={
          <ColumnSelector
            allColumns={allColumns}
            visibleColumnKeys={visibleColumnKeys}
            alwaysVisibleColumns={alwaysVisibleColumns}
            onToggleColumn={toggleColumn}
            onShowAll={showAllColumns}
            onResetToDefault={resetToDefault}
          />
        }
        // Active filters chips component
        activeFiltersComponent={
          <ActiveFiltersChips
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            getCategoryName={getCategoryName}
            getFilterLabel={getFilterLabel}
          />
        }
        // Server-side pagination props
        serverPagination={true}
        paginationData={data?.data?.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
