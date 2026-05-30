'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, UserPlus, FileText, X, Check, Download, ChevronDown } from 'lucide-react';
import StatusChip from '@/components/atoms/StatusChip';
import { getConditionChipColor } from '@/app/utils/statusHelpers';
import TableWrapper from '@/components/Table/TableWrapper';
import StateHandler from '@/components/atoms/StateHandler';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import SearchInput from '@/components/molecules/SearchInput';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import { useFilterHandlers } from '@/app/hooks/useFilterHandlers';
import { usePersistentFilters } from '@/app/hooks/usePersistentFilters';
import CustomButton from '@/components/atoms/CustomButton';
import {
  ASSET_TABLE_ID,
  assetTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/assetTableConfig';
import { transformAssetForTable } from '@/app/utils/dataTransformers';
import { useAssetExport } from '@/app/hooks/useAssetExport';

const statusOptions = ['Under Repair', 'Allocated', 'In Stock', 'Scrap', 'Parted Out'];
const actionOptions = ['View', 'Assign', 'Details'];

export default function AssetsList() {
  const router = useRouter();
  
  // Export functionality
  const { exportToPDF, exportToExcel } = useAssetExport();
  const [isExporting, setIsExporting] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter state (persisted)
  const [filters, setFilters] = usePersistentFilters('assets-filters', {});
  
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
  } = useTableColumns(ASSET_TABLE_ID, assetTableColumns, defaultVisibleColumns);
  
  // Debounce search input (800ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to first page when search changes
    }, 800);
    
    return () => clearTimeout(timer);
  }, [searchInput]);
  
  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Build query string with pagination, filters, and search
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    // Add search parameter first
    if (debouncedSearch) params.append('search', debouncedSearch);
    
    params.append('page', currentPage);
    params.append('limit', pageSize);
    
    if (filters.campus) params.append('campusId', filters.campus);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    
    return params.toString();
  };
  
  // Fetch assets data from API with pagination, filters, and search
  const { data, isLoading, isError, error } = useFetch({
    url: `/assets?${buildQueryString()}`,
    queryKey: ['assets', currentPage, pageSize, filters, debouncedSearch],
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
  
  // Uses custom hook for handling filter removal and clearing
  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers(
    filters,
    setFilters,
    setCurrentPage
  );
  
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

  // Handle PDF export
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      exportToPDF(assetsListData, visibleColumns, 'assets');
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Excel export
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      exportToExcel(assetsListData, visibleColumns, 'assets');
    } catch (error) {
      console.error('Excel export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "assetTag":
        return <span className="font-medium text-gray-800">{cellValue}</span>;
      
      case "status":
        return <StatusChip value={cellValue} />;
      
      case "condition":
        return <StatusChip value={cellValue} colorFn={getConditionChipColor} />;
      
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
      
      case "allocatedTo":
        if (cellValue && typeof cellValue === 'object') {
          return (
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium text-gray-800">
                {cellValue.firstName} {cellValue.lastName}
              </p>
              <p className="text-xs text-gray-500">{cellValue.email}</p>
            </div>
          );
        }
        return <span className="text-xs text-gray-400">—</span>;
      
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
    router.push(`/assets/${asset.id}`);
  };

  const handleCreateClick = () => {
    router.push('/assets/create');
  };

  // Export actions component
  const exportActionsComponent = (
    <div className="relative" ref={exportDropdownRef}>
      <CustomButton
        text={isExporting ? 'Exporting...' : 'Export'}
        icon={Download}
        onClick={() => setExportDropdownOpen((prev) => !prev)}
        variant="secondary"
        size="md"
        disabled={isExporting || assetsListData.length === 0}
        className="flex items-center gap-1 sm:gap-1.5"
      />

      {exportDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
          <p className="text-xs text-gray-400 px-3 pt-1 pb-2">
            Current page ({assetsListData.length} records)
          </p>
          <button
            onClick={() => { handleExportPDF(); setExportDropdownOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-gray-800 text-sm">Export as PDF</p>
              <p className="text-xs text-gray-500">Landscape A4 table</p>
            </div>
          </button>
          <button
            onClick={() => { handleExportExcel(); setExportDropdownOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-gray-800 text-sm">Export as Excel</p>
              <p className="text-xs text-gray-500">.xlsx with auto column widths</p>
            </div>
          </button>
          <div className="border-t border-gray-100 mt-1.5 pt-1.5 px-3 pb-1">
            <p className="text-xs text-gray-400">
              {assetsListData.length} visible records exported
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Handle loading and error states
  if (isError) {
    return (
      <StateHandler
        isLoading={false}
        isError={isError}
        error={error}
        loadingMessage="Loading assets..."
        errorMessage="Error loading assets"
      />
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Table */}
      <div className="flex-1 min-h-0 flex flex-col">
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
        // Search component
        searchComponent={
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by tag, brand, model, or serial number..."
          />
        }
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
            onClearAll={handleClearAllFilters}
            getCategoryName={getCategoryName}
            getFilterLabel={getFilterLabel}
          />
        }
        // Export actions component
        exportActionsComponent={exportActionsComponent}
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
