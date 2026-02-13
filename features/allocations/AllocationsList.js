'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, UserPlus, Calendar, CheckCircle, XCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import SummaryCard from '@/components/atoms/SummaryCard';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import {
  ALLOCATION_TABLE_ID,
  allocationTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/allocationTableConfig';
import { transformAllocationForTable } from '@/app/utils/dataTransformers';
import { allocationsSummaryCards } from '@/dummyJson/dummyJson';

const actionOptions = ['View', 'Return', 'Details'];

export default function AllocationsList() {
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
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
  
  // Build query string with pagination
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', pageSize);
    return params.toString();
  };
  
  // Fetch allocations data from API with pagination
  const { data, isLoading, isError, error } = useFetch({
    url: `/allocations?${buildQueryString()}`,
    queryKey: ['allocations', currentPage, pageSize],
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

  // Transform API data to match table structure
  const allocationsListData = React.useMemo(() => {
    if (!data || !data.data || !Array.isArray(data.data)) return [];
    
    return data.data.map((allocation) => ({
      ...transformAllocationForTable(allocation),
      actions: actionOptions[0], // Default to 'View'
    }));
  }, [data]);

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "allocationId":
        return <span className="font-medium text-blue-600">#{cellValue}</span>;
      case "assetTag":
        return <span className="font-medium text-gray-800">{cellValue}</span>;
      case "userName":
        if (!cellValue || cellValue === 'N/A') {
          return <span className="text-gray-400">Not assigned</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {cellValue.charAt(0).toUpperCase()}
              </span>
            </div>
            <span>{cellValue}</span>
          </div>
        );
      case "status":
        const statusColors = {
          'Active': 'bg-green-100 text-green-800',
          'Returned': 'bg-gray-100 text-gray-800',
        };
        const StatusIcon = item.isActive ? CheckCircle : XCircle;
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            <StatusIcon className="w-3 h-3" />
            {cellValue}
          </span>
        );
      case "reason":
        const reasonColors = {
          'Joiner': 'bg-blue-50 text-blue-700',
          'Repair': 'bg-red-50 text-red-700',
          'Replacement': 'bg-orange-50 text-orange-700',
          'Loaner': 'bg-purple-50 text-purple-700',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${reasonColors[cellValue] || 'bg-gray-50 text-gray-700'}`}>
            {cellValue}
          </span>
        );
      case "endDate":
        if (cellValue === 'Active') {
          return <span className="text-green-600 font-medium">{cellValue}</span>;
        }
        return cellValue;
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/allocations/${item.id}`);
              }}
              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {item.isActive && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReturnAllocation(item.id);
                }}
                className="text-orange-600 hover:text-orange-800 p-1 hover:bg-orange-50 rounded transition-colors"
                title="Mark as Returned"
              >
                <Calendar className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      default:
        return cellValue;
    }
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading allocations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading allocations</p>
          <p className="text-gray-600 mt-2">{error?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {allocationsSummaryCards.map((card) => {
          const IconComponent = LucideIcons[card.icon];
          return (
            <SummaryCard
              key={card.id}
              label={card.label}
              value={card.getValue(allocationsListData)}
              Icon={IconComponent}
              valueColor={card.valueColor}
              iconColor={card.iconColor}
            />
          );
        })}
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
        // Server-side pagination props
        serverPagination={true}
        paginationData={data?.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

