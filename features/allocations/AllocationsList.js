'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, UserPlus, Calendar, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import StatusChip from '@/components/atoms/StatusChip';
import {
  getAllocationTypeChipColor,
  getAllocationReasonChipColor,
  getDeviceModeChipColor,
  getStatusChipColor,
  CHIP_CLASSES,
} from '@/app/utils/statusHelpers';
import * as LucideIcons from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import SummaryCard from '@/components/atoms/SummaryCard';
import StateHandler from '@/components/atoms/StateHandler';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import SearchInput from '@/components/molecules/SearchInput';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import { useFilterHandlers } from '@/app/hooks/useFilterHandlers';
import { usePersistentState } from '@/app/hooks/usePersistentState';
import {
  ALLOCATION_TABLE_ID,
  allocationTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/allocationTableConfig';
import { transformAllocationForTable } from '@/app/utils/dataTransformers';
import { allocationSummaryCardsConfig } from '@/dummyJson/dummyJson';
import GenericCellRenderer from '@/components/Table/GenericCellRenderer';

const actionOptions = ['View', 'Return', 'Details'];

export default function AllocationsList() {
  const router = useRouter();
  
  // Pagination state (persisted)
  const [paginationState, setPaginationState] = usePersistentState('allocations-pagination', { currentPage: 1, pageSize: 20 });
  const { currentPage, pageSize } = paginationState;
  
  // Dashboard toggle state
  const [showCards, setShowCards] = useState(false);
  
  // Filter state (persisted)
  const [filters, setFilters] = usePersistentState('allocations-filters', {});

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
  } = useTableColumns(ALLOCATION_TABLE_ID, allocationTableColumns, defaultVisibleColumns);
  
  // Debounce search input (800ms delay)
  const prevSearchRef = React.useRef(searchInput);
  useEffect(() => {
    if (prevSearchRef.current === searchInput) return;
    const timer = setTimeout(() => {
      prevSearchRef.current = searchInput;
      setDebouncedSearch(searchInput);
      setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    }, 800);
    return () => clearTimeout(timer);
  }, [searchInput]);
  
  // Status filter options for allocations
  const allocationStatusOptions = [
    { value: 'ALLOCATED', label: 'Allocated' },
    { value: 'ALLOCATION_COMPLETED', label: 'Allocation Completed' },
  ];

  // Build query string with pagination, filters, and search
  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.append('search', debouncedSearch);

    params.append('page', currentPage);
    params.append('limit', pageSize);

    if (filters.status) params.append('status', filters.status);

    return params.toString();
  };
  
  // Fetch allocations data from API with pagination and search
  const { data, isLoading, isError, error } = useFetch({
    url: `/allocations?${buildQueryString()}`,
    queryKey: ['allocations', currentPage, pageSize, filters, debouncedSearch],
  });

  // Fetch allocation counts from API
  const { data: allocationCountsData } = useFetch({
    url: '/allocations/count',
    queryKey: ['allocations-count'],
  });

  // Summary cards configuration
  const summaryCards = React.useMemo(() => {
    if (!allocationCountsData?.data) return [];
    
    return allocationSummaryCardsConfig.map((config) => ({
      label: config.label,
      value: allocationCountsData.data[config.dataKey] ?? 0,
      Icon: LucideIcons[config.iconName],
      valueColor: config.valueColor,
      iconColor: config.iconColor,
      borderColor: config.borderColor,
    }));
  }, [allocationCountsData]);


  // Handle page change
  const handlePageChange = (page) => {
    setPaginationState((prev) => ({ ...prev, currentPage: page }));
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPaginationState({ currentPage: 1, pageSize: newSize });
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Uses custom hook for handling filter removal and clearing
  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers(
    filters,
    setFilters,
    () => setPaginationState((prev) => ({ ...prev, currentPage: 1 }))
  );

  // Get label for a filter value
  const getFilterLabel = (filterKey, value) => {
    if (filterKey === 'status') {
      const statusOption = allocationStatusOptions.find((opt) => opt.value === value);
      return statusOption ? statusOption.label : value;
    }
    return value;
  };

  // Get category name for display
  const getCategoryName = (filterKey) => {
    const categoryNames = {
      status: 'Status',
    };
    return categoryNames[filterKey] || filterKey;
  };

  // Transform API data to match table structure
  const allocationsListData = React.useMemo(() => {
    if (!data || !data.data || !Array.isArray(data.data)) return [];
    
    return data.data.map((allocation) => ({
      ...transformAllocationForTable(allocation),
    }));
  }, [data]);

  const renderCell = (item, columnKey) => {
    const columnDef = allocationTableColumns.find(col => col.key === columnKey); 
    return <GenericCellRenderer item={item} column={columnDef || { key: columnKey }} />;
  };

  const handleRowClick = (allocation) => {
    router.push(`/allocations/${allocation.id}`);
  };

  const handleCreateClick = () => {
    router.push('/allocations/create');
  };

  const handleReturnAllocation = async (allocationId) => {
    const confirmed = confirm('Are you sure you want to mark this allocation as returned?');
    if (!confirmed) return;

    try {
      const response = await fetch(config.getApiUrl(config.endpoints.allocations?.update?.(allocationId) || `/allocations/${allocationId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update allocation');
      }

      alert('Allocation marked as returned successfully!');
      // Refetch data
      // queryClient.invalidateQueries(['allocations']);
    } catch (error) {
      console.error('Error updating allocation:', error);
      alert('Failed to mark allocation as returned. Please try again.');
    }
  };

  // Handle loading and error states
  if (isError) {
    return (
      <StateHandler
        isLoading={false}
        isError={isError}
        error={error}
        loadingMessage="Loading allocations..."
        errorMessage="Error loading allocations"
      />
    );
  }

 return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Table */}
      <div className='flex-1 min-h-0 flex flex-col' >
        <TableWrapper
        margin='m-0'
        showDashboardToggle={true}
        showCards={showCards}
        onToggleCards={() => setShowCards((prev) => !prev)}
        scrollKey="allocations-list"
        summaryCardsComponent={showCards ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <SummaryCard
                key={card.label}
                label={card.label}
                value={card.value}
                Icon={card.Icon}
                valueColor={card.valueColor}
                iconColor={card.iconColor}
              />
            ))}
          </div>
        ) : null}
        data={allocationsListData}
        columns={visibleColumns}
        title="Allocations"
        renderCell={renderCell}
        itemsPerPage={pageSize}
        showPagination={true}
        ariaLabel="Allocations table"
        onRowClick={handleRowClick}
        // showCreateButton={true}
        // onCreateClick={handleCreateClick}
        // Search component
        searchComponent={
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by allocation type, reason, or notes..."
          />
        }
        // Filter component
        filterComponent={
          <FilterDropdown
            onFilterChange={handleFilterChange}
            statusOptions={allocationStatusOptions}
            selectedFilters={filters}
          />
        }
        // Active filters chips component
        activeFiltersComponent={
          <ActiveFiltersChips
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
            getCategoryName={getCategoryName}
            getFilterLabel={getFilterLabel}
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
        // Loading state
        isLoading={isLoading}
        // Server-side pagination props
        serverPagination={true}
        paginationData={data?.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      </div>
    </div>
  );
}

