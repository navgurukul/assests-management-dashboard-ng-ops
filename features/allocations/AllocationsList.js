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
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { useTableColumns } from '@/app/hooks/useTableColumns';
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
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
  
  // Fetch allocations data from API with pagination and search
  const { data, isLoading, isError, error } = useFetch({
    url: `/allocations?${buildQueryString()}`,
    queryKey: ['allocations', currentPage, pageSize, debouncedSearch],
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
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
            Icon={card.Icon}
            valueColor={card.valueColor}
            iconColor={card.iconColor}
            borderColor={card.borderColor}
          />
        ))}
      </div>

      {/* Table */}
      <TableWrapper
        data={allocationsListData}
        columns={visibleColumns}
        title="Allocations"
        renderCell={renderCell}
        itemsPerPage={pageSize}
        showPagination={true}
        ariaLabel="Allocations table"
        onRowClick={handleRowClick}
        showCreateButton={true}
        onCreateClick={handleCreateClick}
        // Search component
        searchComponent={
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search allocations..."
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
  );
}

