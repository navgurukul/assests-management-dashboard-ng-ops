'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, UserPlus, FileText, X, Check } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import {
  ASSET_TABLE_ID,
  assetTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/assetTableConfig';
import { transformAssetForTable } from '@/app/utils/dataTransformers';

const statusOptions = ['Under Repair', 'Allocated', 'In Stock', 'Scrap', 'Parted Out'];
const actionOptions = ['View', 'Assign', 'Details'];

export default function AssetsList() {
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter state
  const [filters, setFilters] = useState({});
  
  // Column visibility management
  const {
    visibleColumns,
    visibleColumnKeys,
    allColumns,
    toggleColumn,
    showAllColumns,
    resetToDefault,
    alwaysVisibleColumns,
  } = useTableColumns(ASSET_TABLE_ID, assetTableColumns, defaultVisibleColumns);
  
  // Build query string with filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', pageSize);
    
    if (filters.campus) params.append('campusId', filters.campus);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    
    return params.toString();
  };
  
  // Fetch assets data from API with pagination and filters
  const { data, isLoading, isError, error } = useFetch({
    url: `/assets?${buildQueryString()}`,
    queryKey: ['assets', currentPage, pageSize, filters],
  });
  
  // Fetch campus options from API
  const { data: campusData } = useFetch({
    url: '/campuses',
    queryKey: ['campuses'],
  });
  
  // Fetch asset types from API
  const { data: assetTypesData } = useFetch({
    url: '/asset-types',
    queryKey: ['asset-types'],
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
  
  // Transform campus data from API to filter options
  const campusOptions = React.useMemo(() => {
    if (!campusData || !campusData.data) return [];
    
    return campusData.data.map((campus) => ({
      value: campus.id,
      label: campus.campusName,
    }));
  }, [campusData]);
  
  // Transform asset types data from API to filter options
  const assetTypeOptions = React.useMemo(() => {
    if (!assetTypesData || !assetTypesData.data) return [];
    
    return assetTypesData.data.map((assetType) => ({
      value: assetType.id,
      label: assetType.name,
    }));
  }, [assetTypesData]);
  
  // Status filter options
  const filterStatusOptions = [
    { value: 'IN_STOCK', label: 'In Stock' },
    { value: 'ALLOCATED', label: 'Allocated' },
    { value: 'REPAIR', label: 'Under Repair' },
    { value: 'SCRAP', label: 'Scrap' },
    { value: 'PARTED_OUT', label: 'Parted Out' },
  ];
  
  // Get label for a filter value
  const getFilterLabel = (filterKey, value) => {
    if (filterKey === 'campus') {
      const campus = campusOptions.find(opt => opt.value === value);
      return campus ? campus.label : value;
    }
    if (filterKey === 'type') {
      const assetType = assetTypeOptions.find(opt => opt.value === value);
      return assetType ? assetType.label : value;
    }
    if (filterKey === 'status') {
      const status = filterStatusOptions.find(opt => opt.value === value);
      return status ? status.label : value;
    }
    return value;
  };
  
  // Get category name for display
  const getCategoryName = (filterKey) => {
    const categoryNames = {
      campus: 'Campus',
      type: 'Asset Type',
      status: 'Status'
    };
    return categoryNames[filterKey] || filterKey;
  };

  // Transform API data to match table structure
  const assetsListData = React.useMemo(() => {
    if (!data || !data.data) return [];
    
    return data.data.map((asset) => ({
      ...transformAssetForTable(asset),
      actions: actionOptions[0], // Default to 'View'
    }));
  }, [data]);

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "assetTag":
        return <span className="font-medium text-gray-800">{cellValue}</span>;
      
      case "status":
        const statusColors = {
          'Under Repair': 'bg-red-100 text-red-800',
          'Allocated': 'bg-green-100 text-green-800',
          'In Stock': 'bg-blue-100 text-blue-800',
          'Scrap': 'bg-gray-100 text-gray-800',
          'Parted Out': 'bg-orange-100 text-orange-800',
        };
        return (
          <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      
      case "condition":
        const conditionColors = {
          'Working': 'bg-green-100 text-green-800',
          'Damaged': 'bg-orange-100 text-orange-800',
          'Faulty': 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-3 py-1 rounded text-xs font-medium ${conditionColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      
      case "charger":
      case "bag":
        return (
          <div className="flex items-center justify-center">
            {cellValue ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
          </div>
        );
      
      case "cost":
        return <span className="font-medium text-gray-700">{cellValue}</span>;
      
      case "actions":
        const actionIcons = {
          'View': <Eye className="w-4 h-4" />,
          'Assign': <UserPlus className="w-4 h-4" />,
          'Details': <FileText className="w-4 h-4" />,
        };
        const actionColors = {
          'View': 'text-blue-600 hover:text-blue-800',
          'Assign': 'text-green-600 hover:text-green-800',
          'Details': 'text-gray-600 hover:text-gray-800',
        };
        return (
          <button className={`flex items-center gap-1 font-medium ${actionColors[cellValue] || 'text-blue-600 hover:text-blue-800'}`}>
            {actionIcons[cellValue]}
            <span>{cellValue}</span>
          </button>
        );
      
      default:
        return <span className="text-gray-700">{cellValue}</span>;
    }
  };

  const handleRowClick = (asset) => {
    // Store asset data in sessionStorage to pass to details page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentAssetData', JSON.stringify(asset.assetData));
    }
    router.push(`/assets/${asset.id}`);
  };

  const handleCreateClick = () => {
    router.push('/assets/create');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading assets</p>
          <p className="text-gray-600 mt-2">{error?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <TableWrapper
        data={assetsListData}
        columns={visibleColumns}
        title="Assets"
        renderCell={renderCell}
        itemsPerPage={pageSize}
        showPagination={true}
        ariaLabel="Assets table"
        onRowClick={handleRowClick}
        showCreateButton={true}
        onCreateClick={handleCreateClick}
        // Filter component
        filterComponent={
          <FilterDropdown
            onFilterChange={handleFilterChange}
            campusOptions={campusOptions}
            statusOptions={filterStatusOptions}
            assetTypeOptions={assetTypeOptions}
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
        paginationData={data?.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
