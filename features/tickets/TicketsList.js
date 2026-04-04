'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TableWrapper from '@/components/Table/TableWrapper';
import StateHandler from '@/components/atoms/StateHandler';
import SLAIndicator from '@/components/molecules/SLAIndicator';
import SearchInput from '@/components/molecules/SearchInput';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import StatusChip from '@/components/atoms/StatusChip';
import SummaryCard from '@/components/atoms/SummaryCard';
import { Ticket, AlertCircle, Clock, CheckCircle, XCircle, TrendingUp, BarChart2, AlertTriangle } from 'lucide-react';
import { getPriorityChipColor } from '@/app/utils/statusHelpers';
import { ticketDetailsData } from '@/dummyJson/dummyJson';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import GenericCellRenderer from '@/components/Table/GenericCellRenderer';
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
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isShowAllMode, setIsShowAllMode] = useState(false);

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
        const authData = JSON.parse(authRaw);
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

    if (isShowAllMode) {
      params.append('page', currentPage);
      params.append('limit', pageSize);
    } else if (assigneeEmail) {
      params.append('assigneeEmail', assigneeEmail);
    }

    // Add filters
    if (filters.campus) params.append('campusId', filters.campus);
    if (filters.status) params.append('status', statusApiMap[filters.status] || filters.status);
    if (filters.assignee) params.append('assigneeId', filters.assignee);
    
    return params.toString();
  };

  // Fetch tickets data from API with pagination, filters, and search
  const { data, isLoading, isError, error } = useFetch({
    url: `/tickets?${buildQueryString()}`,
    queryKey: ['tickets', isShowAllMode, assigneeEmail, currentPage, pageSize, filters, debouncedSearch],
    enabled: isAuthReady,
  });

  // Fetch consolidated data by campus
  const { data: consolidatedData } = useFetch({
    url: '/tickets/count',
    queryKey: ['assets-consolidated-by-campus'],
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
    setIsShowAllMode(false);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle removing a single filter chip
  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Toggle between all tickets and my assigned tickets
  const handleShowAll = () => {
    setIsShowAllMode((prev) => !prev);
    setFilters({});
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
    { value: 'RAISED', label: 'Raised' },
    { value: 'ESCALATED', label: 'Escaleted' },
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

  // Handle loading and error states
  if (isError) {
    return (
      <StateHandler
        isLoading={false}
        isError={isError}
        error={error}
        loadingMessage="Loading tickets..."
        errorMessage="Error loading tickets"
      />
    );
  }

  const summary = consolidatedData?.data?.summary;
  const summaryTotal = consolidatedData?.data?.total;

  const handleCardClick = (status) => {
    const newFilters = { ...filters };
    if (!status) {
      delete newFilters.status;
    } else {
      newFilters.status = status;
    }
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const summaryCards = [
    { label: 'Total', status: null, value: summaryTotal ?? 0, Icon: BarChart2, valueColor: 'text-gray-900', iconColor: 'text-gray-500', borderColor: 'border-gray-200' },
    { label: 'Open', status: 'OPEN', value: summary?.open ?? 0, Icon: Ticket, valueColor: 'text-blue-600', iconColor: 'text-blue-400', borderColor: 'border-blue-200' },
    { label: 'Raised', status: 'RAISED', value: summary?.raised ?? 0, Icon: TrendingUp, valueColor: 'text-indigo-600', iconColor: 'text-indigo-400', borderColor: 'border-indigo-200' },
    { label: 'In Progress', status: 'IN_PROGRESS', value: summary?.inProgress ?? 0, Icon: Clock, valueColor: 'text-yellow-600', iconColor: 'text-yellow-400', borderColor: 'border-yellow-200' },
    { label: 'Escalated', status: 'ESCALATED', value: summary?.escalated ?? 0, Icon: AlertCircle, valueColor: 'text-orange-600', iconColor: 'text-orange-400', borderColor: 'border-orange-200' },
    { label: 'Overdue', status: 'OVERDUE', value: summary?.overdue ?? 0, Icon: AlertTriangle, valueColor: 'text-red-600', iconColor: 'text-red-400', borderColor: 'border-red-200' },
    { label: 'Resolved', status: 'RESOLVED', value: summary?.resolved ?? 0, Icon: CheckCircle, valueColor: 'text-green-600', iconColor: 'text-green-400', borderColor: 'border-green-200' },
    { label: 'Closed', status: 'CLOSED', value: summary?.closed ?? 0, Icon: XCircle, valueColor: 'text-gray-500', iconColor: 'text-gray-400', borderColor: 'border-gray-200' },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 p-6">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
            Icon={card.Icon}
            valueColor={card.valueColor}
            iconColor={card.iconColor}
            borderColor={card.borderColor}
            clickable={true}
            onClick={() => handleCardClick(card.status)}
            isActive={card.status === null ? !filters.status : filters.status === card.status}
          />
        ))}
      </div>

      {/* Table */}
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
    </div>
  );
}
