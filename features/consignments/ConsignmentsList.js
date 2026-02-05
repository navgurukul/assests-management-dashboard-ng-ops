'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, ExternalLink, Eye } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import SearchInput from '@/components/molecules/SearchInput';
import ActionMenu from '@/components/molecules/ActionMenu';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import {
  CONSIGNMENT_TABLE_ID,
  consignmentTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/consignmentTableConfig';
import { transformConsignmentForTable } from '@/app/utils/dataTransformers';
import { consignmentsListData } from '@/dummyJson/dummyJson';

const actionOptions = ['View', 'Details', 'Update Status'];

export default function ConsignmentsList() {
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter state
  const [filters, setFilters] = useState({});
  
  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Menu state
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Column visibility management
  const {
    visibleColumns,
    visibleColumnKeys,
    allColumns,
    toggleColumn,
    showAllColumns,
    resetToDefault,
    alwaysVisibleColumns,
  } = useTableColumns(CONSIGNMENT_TABLE_ID, consignmentTableColumns, defaultVisibleColumns);
  
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
    
    if (filters.status) params.append('status', filters.status);
    if (filters.courier) params.append('courierServiceId', filters.courier);
    if (filters.allocation) params.append('allocationId', filters.allocation);
    
    return params.toString();
  };
  
  // Fetch consignments data from API with pagination, filters, and search
  const { data, isLoading, isError, error } = useFetch({
    url: `/consignments?${buildQueryString()}`,
    queryKey: ['consignments', currentPage, pageSize, filters, debouncedSearch],
  });
  
  // Fetch courier services from API
  const { data: courierData } = useFetch({
    url: '/courier-services',
    queryKey: ['courier-services'],
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
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle removing a single filter chip
  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  // Transform courier data from API to filter options
  const courierOptions = React.useMemo(() => {
    if (!courierData || !courierData.data) return [];
    
    return courierData.data.map((courier) => ({
      value: courier.id,
      label: courier.name,
    }));
  }, [courierData]);
  
  // Status filter options
  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'RETURNED', label: 'Returned' },
  ];
  
  // Get label for a filter value
  const getFilterLabel = (filterKey, value) => {
    if (filterKey === 'courier') {
      const option = courierOptions.find((opt) => opt.value === value);
      return option ? option.label : value;
    }
    if (filterKey === 'status') {
      const option = statusOptions.find((opt) => opt.value === value);
      return option ? option.label : value;
    }
    return value;
  };
  
  // Define filters configuration
  const filtersConfig = [
    {
      key: 'status',
      label: 'Status',
      options: statusOptions,
    },
    {
      key: 'courier',
      label: 'Courier Service',
      options: courierOptions,
    },
  ];
  
  // Process API data to table format
  const tableData = React.useMemo(() => {
    // Use dummy data if API data is not available (for development/testing)
    const sourceData = (data && data.data) ? data.data : consignmentsListData;
    
    return sourceData.map((consignment) => {
      // Use transformer if available, otherwise format directly
      if (typeof transformConsignmentForTable === 'function') {
        return transformConsignmentForTable(consignment);
      }
      
      // Default formatting
      return {
        id: consignment.id,
        consignmentCode: consignment.consignmentCode || consignment.code || `CON-${consignment.id}`,
        status: consignment.status,
        allocationCode: consignment.allocation?.allocationCode || consignment.allocationCode || '-',
        courierService: consignment.courierService?.name || consignment.courierServiceName || '-',
        source: consignment.source || consignment.allocation?.sourceCampus?.name || '-',
        destination: consignment.destination || consignment.allocation?.destinationCampus?.name || '-',
        shippedAt: consignment.shippedAt ? new Date(consignment.shippedAt).toLocaleDateString() : '-',
        estimatedDeliveryDate: consignment.estimatedDeliveryDate ? new Date(consignment.estimatedDeliveryDate).toLocaleDateString() : '-',
        trackingId: consignment.trackingId || '-',
        assetCount: consignment.assets?.length || consignment.assetCount || 0,
        deliveredAt: consignment.deliveredAt ? new Date(consignment.deliveredAt).toLocaleDateString() : '-',
        createdBy: consignment.createdBy?.name || '-',
        createdAt: consignment.createdAt ? new Date(consignment.createdAt).toLocaleDateString() : '-',
      };
    });
  }, [data]);
  
  // Get pagination metadata
  const totalItems = data?.pagination?.total || data?.total || consignmentsListData.length;
  const totalPages = data?.pagination?.totalPages || Math.ceil(totalItems / pageSize) || 1;
  
  // Handle row click - navigate to details page
  const handleRowClick = (item) => {
    // Store consignment data in sessionStorage for details page
    if (typeof window !== 'undefined') {
      // Find the full consignment data from the original API response or dummy data
      const sourceData = (data && data.data) ? data.data : consignmentsListData;
      const fullConsignment = sourceData.find(c => c.id === item.id);
      if (fullConsignment) {
        sessionStorage.setItem('currentConsignmentData', JSON.stringify(fullConsignment));
      } else if (item.consignmentData) {
        // Fallback to transformed data if available
        sessionStorage.setItem('currentConsignmentData', JSON.stringify(item.consignmentData));
      }
    }
    router.push(`/consignments/${item.id}`);
  };
  
  // Handle create button click
  const handleCreateClick = () => {
    router.push('/consignments/create');
  };

  // Show loading only on initial load (when we're actually waiting for API and not using dummy data)
  const showLoading = isLoading && !consignmentsListData;

  // Error state - only show warning banner, not full-page error (since we have dummy data fallback)
  const showErrorBanner = isError && !data;
  
  // Render cell content with custom formatting
  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case 'consignmentCode':
        return (
          <span className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
            {cellValue}
          </span>
        );
        
      case 'status':
        const statusColors = {
          'PENDING': 'bg-yellow-100 text-yellow-800',
          'IN_TRANSIT': 'bg-blue-100 text-blue-800',
          'DELIVERED': 'bg-green-100 text-green-800',
          'CANCELLED': 'bg-red-100 text-red-800',
          'RETURNED': 'bg-orange-100 text-orange-800',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue?.replace('_', ' ')}
          </span>
        );
        
      case 'actions':
        const menuOptions = [];
        
        // Always add Show Details option
        menuOptions.push({
          label: 'Show Details',
          icon: Eye,
          onClick: () => {
            router.push(`/consignments/${item.id}`);
            setOpenMenuId(null);
          },
        });
        
        // Add Track option if tracking ID exists
        if (item.trackingId && item.trackingId !== '-') {
          menuOptions.push({
            label: 'Track Consignment',
            icon: ExternalLink,
            onClick: () => {
              window.open(`https://www.google.com/search?q=${encodeURIComponent(item.trackingId + ' tracking')}`, '_blank');
              setOpenMenuId(null);
            },
          });
        }
        
        return (
          <div className="relative flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === item.id ? null : item.id);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Actions menu"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
            {openMenuId === item.id && (
              <ActionMenu
                menuOptions={menuOptions}
                onClose={() => setOpenMenuId(null)}
              />
            )}
          </div>
        );
        
      default:
        return cellValue;
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Banner - show when API fails but we're using dummy data */}
      {showErrorBanner && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Using sample data:</strong> Unable to connect to server. Displaying sample consignments for demonstration.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <TableWrapper
        key={`table-${openMenuId || 'none'}`}
        data={tableData}
        columns={visibleColumns}
        title="Consignments"
        renderCell={renderCell}
        onRowClick={handleRowClick}
        itemsPerPage={pageSize}
        showPagination={true}
        ariaLabel="Consignments table"
        showCreateButton={true}
        onCreateClick={handleCreateClick}
        // Loading state
        isLoading={showLoading}
        // Search component
        searchComponent={
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search consignments..."
          />
        }
        // Filter component
        filterComponent={
          <FilterDropdown
            filters={filtersConfig}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
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
            onReset={resetToDefault}
          />
        }
        // Active filters chips component
        activeFiltersComponent={
          Object.keys(filters).length > 0 && (
            <ActiveFiltersChips
              filters={filters}
              getFilterLabel={getFilterLabel}
              onRemoveFilter={handleRemoveFilter}
            />
          )
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
