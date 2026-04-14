'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TableWrapper from '@/components/Table/TableWrapper';
import SearchInput from '@/components/molecules/SearchInput';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import { decryptData } from '@/app/utils/storageUtils';
import useFetch from '@/app/hooks/query/useFetch';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import GenericCellRenderer from '@/components/Table/GenericCellRenderer';
import { ticketDetailsData } from '@/dummyJson/dummyJson';
import {
  TICKET_TABLE_ID,
  ticketTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/ticketTableConfig';

export default function TicketsTable({ filters = {}, onFilterChange }) {
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isShowAllMode, setIsShowAllMode] = useState(true);

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

  // Read assignee email from localStorage auth key on first render
  useEffect(() => {
    try {
      const authRaw = localStorage.getItem('__AUTH__');
      if (authRaw) {
        const authData = decryptData(authRaw);
        const email = authData?.email || authData?.user?.email || '';
        setAssigneeEmail(email);
      }
    } catch (error) {
      console.error('Error reading __AUTH__ from localStorage:', error);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  // Build query string with pagination, filters, and search
  const buildQueryString = () => {
    const params = new URLSearchParams();

    const statusApiMap = {
      RAISED: 'CLOSED',
      ESCALATED: 'REJECTED',
    };
    
    // Add search parameter first
    if (debouncedSearch) params.append('search', debouncedSearch);

    const isAssignedFalse = filters?.isAssigned === 'false';

    if (isShowAllMode) {
      params.append('page', currentPage);
      params.append('limit', pageSize);
    } else if (assigneeEmail && !isAssignedFalse) {
      params.append('assigneeEmail', assigneeEmail);
    }

    // Add filters
    if (filters?.campus) params.append('campusId', filters.campus);
    if (filters?.status) params.append('status', statusApiMap[filters.status] || filters.status);
    if (filters?.assignee && !isAssignedFalse) params.append('assigneeId', filters.assignee);
    if (filters?.isAssigned !== undefined && filters?.isAssigned !== null && filters?.isAssigned !== '') {
      params.append('isAssigned', filters.isAssigned);
    }
    
    return params.toString();
  };

  // Fetch tickets data from API with pagination, filters, and search
  const { data, isLoading } = useFetch({
    url: `/tickets?${buildQueryString()}`,
    queryKey: ['tickets', isShowAllMode, assigneeEmail, currentPage, pageSize, filters, debouncedSearch],
    enabled: isAuthReady,
  });

  // Fetch campus options from API
  const { data: campusData } = useFetch({
    url: '/campuses',
    queryKey: ['campuses'],
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

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    onFilterChange(newFilters);
    setIsShowAllMode(false);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle removing a single filter chip
  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    onFilterChange(newFilters);
    setCurrentPage(1);
  };

  // Toggle between all tickets and my assigned tickets
  const handleShowAll = () => {
    setIsShowAllMode((prev) => !prev);
    onFilterChange({});
    setSearchInput('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const showAllButtonText = isShowAllMode
    ? 'My Tickets'
    : 'Show All';

  // Transform campus data from API to filter options
  const campusOptions = React.useMemo(() => {
    if (!campusData || !campusData.data) return [];
    
    return campusData.data.map((campus) => ({
      value: campus.id,
      label: campus.campusName,
    }));
  }, [campusData]);

  // Status filter options based on API documentation
  const filterStatusOptions = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'RAISED', label: 'Raised' },
    { value: 'ESCALATED', label: 'Escaleted' },
  ];

  // isAssigned filter options
  const isAssignedOptions = [
    { value: 'true', label: 'Assigned' },
    { value: 'false', label: 'Unassigned' },
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
    if (filterKey === 'isAssigned') {
      return value === 'true' ? 'Assigned' : 'Unassigned';
    }
    return value;
  };

  // Get category name for display
  const getCategoryName = (filterKey) => {
    const categoryNames = {
      campus: 'Campus',
      status: 'Status',
      assignee: 'Assigned To',
      isAssigned: 'Unassigned Ticket',
    };
    return categoryNames[filterKey] || filterKey;
  };

  const ticketsData = React.useMemo(() => {
    const tickets = data?.data?.tickets || data?.data || [];
    if (!Array.isArray(tickets)) return [];

    return tickets.map((ticket) => {
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

  const hasServerPagination = Boolean(data?.data?.pagination?.totalPages);

  const renderCell = (item, columnKey) => {
    // Special handling just for 'device' to retrieve derived info from ticketDetailsData
    if (columnKey === 'device') {
      const details = ticketDetailsData[item.id];
      const deviceTag = details?.deviceSummary?.asset || item[columnKey];
      return <span className="text-gray-700">{deviceTag}</span>;
    }

    const columnDef = ticketTableColumns.find(col => col.key === columnKey); 
    return <GenericCellRenderer item={item} column={columnDef || { key: columnKey }} />;
  };

  const handleCreateClick = () => {
    router.push('/tickets/create');
  };

  const handleRowClick = (ticket) => {
    router.push(`/tickets/${ticket.id}`);
  };

  return (
    <TableWrapper
      data={ticketsData}
      columns={visibleColumns}
      title="Tickets"
      renderCell={renderCell}
      itemsPerPage={pageSize}
      showPagination={isShowAllMode && hasServerPagination}
      ariaLabel="Tickets table"
      onRowClick={handleRowClick}
      showCreateButton={true}
      onCreateClick={handleCreateClick}
      onShowAll={handleShowAll}
      showAllButtonText={showAllButtonText}
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
          isAssignedOptions={isAssignedOptions}
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
      // Loading state
      isLoading={isLoading}
      // Server-side pagination props
      serverPagination={isShowAllMode && hasServerPagination}
      paginationData={data?.data?.pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
