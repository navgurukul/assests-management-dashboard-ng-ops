'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, UserPlus, FileText, X, Check, Download, BarChart2, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import StatusChip from '@/components/atoms/StatusChip';
import { getConditionChipColor, getHealthStatusChipColor } from '@/app/utils/statusHelpers';
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
import { usePersistentState } from '@/app/hooks/usePersistentState';
import CustomButton from '@/components/atoms/CustomButton';
import SummaryCard from '@/components/atoms/SummaryCard';
import {
  ASSET_TABLE_ID,
  assetTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/assetTableConfig';
import { transformAssetForTable } from '@/app/utils/dataTransformers';
import { useAssetExport } from '@/app/hooks/useAssetExport';
import { useAppSelector } from '@/app/store/hooks';
import { selectUserRole } from '@/app/store/slices/appSlice';

const statusOptions = ['Under Repair', 'Allocated', 'In Stock', 'Scrap', 'Parted Out'];
const actionOptions = ['View', 'Assign', 'Details'];

export default function AssetsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRole = useAppSelector(selectUserRole);
  const canCreateAsset = userRole !== 'CAMPUS_MANAGER';
  
  // Export functionality
  const { exportToPDF, exportToCSV } = useAssetExport();
  const [isExporting, setIsExporting] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);
  
  // Pagination state (persisted)
  const [paginationState, setPaginationState] = usePersistentState('assets-pagination', { currentPage: 1, pageSize: 20 });
  const { currentPage, pageSize } = paginationState;
  
  // Dashboard toggle state
  const [showCards, setShowCards] = useState(false);
  
  // Filter state (persisted) - Initialize with URL parameters
  const [filters, setFilters] = usePersistentState('assets-filters', {});
  
  // Initialize filters from URL parameters on component mount
  useEffect(() => {
    const urlFilters = {};
    
    // Check for ownedBy parameter
    const ownedByParam = searchParams.get('ownedBy');
    if (ownedByParam) {
      urlFilters.ownedBy = ownedByParam;
    }
  
    // Check for campus parameter
    const campusParam = searchParams.get('campusId');
    if (campusParam) {
      urlFilters.campus = campusParam;
    }
    // Check for type perameter
    const typeParam = searchParams.get('type');
    if (typeParam) {
      urlFilters.type = typeParam;
    }

    // Only update if there are URL parameters
    if (Object.keys(urlFilters).length > 0) {
      setFilters(prevFilters => ({
        ...prevFilters,
        ...urlFilters
      }));
    }
  }, [searchParams]); // Remove setFilters from dependency array
  
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
  const prevSearchRef = useRef(searchInput);
  useEffect(() => {
    if (prevSearchRef.current === searchInput) return;
    const timer = setTimeout(() => {
      prevSearchRef.current = searchInput;
      setDebouncedSearch(searchInput);
      setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
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
    if (filters.healthStatus) params.append('healthStatus', filters.healthStatus);
    if (filters.ownedBy) params.append('ownedBy', filters.ownedBy);
    
    return params.toString();
  };
  
  // Fetch assets data from API with pagination, filters, and search
  const { data, isLoading, isError, error } = useFetch({
    url: `/assets?${buildQueryString()}`,
    queryKey: ['assets', currentPage, pageSize, filters, debouncedSearch],
  });

  // Fetch maintenance health status counts
  const { data: maintenanceCountData } = useFetch({
    url: '/maintenance-history/count',
    queryKey: ['maintenance-history-count'],
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
  
  // Transform campus data from API to filter options
  const campusOptions = useMemo(() => {
    if (!campusData || !campusData.data) return [];
    
    return campusData.data.map((campus) => ({
      value: campus.id,
      label: campus.campusName,
    }));
  }, [campusData]);
  
  // Transform asset types data from API to filter options
  const assetTypeOptions = useMemo(() => {
    if (!assetTypesData || !assetTypesData.data) return [];
    
    return assetTypesData.data
    .filter((assetType) => assetType.assetCategory?.name !== 'Components')
    .map((assetType) => ({
      value: assetType.id,
      label: assetType.name,
    }));
  }, [assetTypesData]);
  
  // Status filter options - memoize to prevent rerenders
  const filterStatusOptions = useMemo(() => [
    { value: 'IN_STOCK', label: 'In Stock' },
    { value: 'ALLOCATED', label: 'Allocated' },
    { value: 'REPAIR', label: 'Under Repair' },
    { value: 'SCRAP', label: 'Scrap' },
    { value: 'PARTED_OUT', label: 'Parted Out' },
  ], []);

  // Health status filter options - memoize to prevent rerenders
  const healthStatusOptions = useMemo(() => [
    { value: 'HEALTHY', label: 'Healthy' },
    { value: 'SERVICE_DUE', label: 'Service Due' },
    { value: 'NEED_ATTENTION', label: 'Need Attention' },
    { value: 'INSPECTION_DUE', label: 'Inspection Due' },
  ], []);

  // Owned By filter options - memoize to prevent rerenders
  const ownedByOptions = useMemo(() => [
    { value: 'lws', label: 'LWS' },
    { value: 'lis', label: 'LIS' },
    { value: 'lr', label: 'LR' },
    { value: 'lnw', label: 'LNW' },
    { value: 'lwfhe', label: 'LWFHE' },
    { value: 'lct', label: 'LCT' },
    { value: 'lsd/b', label: 'LSD/B' },
  ], []);
  
  // Get label for a filter value - memoize this function
  const getFilterLabel = useCallback((filterKey, value) => {
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
    if (filterKey === 'healthStatus') {
      const status = healthStatusOptions.find(opt => opt.value === value);
      return status ? status.label : value;
    }
    if (filterKey === 'ownedBy') {
      const ownedBy = ownedByOptions.find(opt => opt.value === value);
      return ownedBy ? ownedBy.label : value;
    }
    return value;
  }, [campusOptions, assetTypeOptions, filterStatusOptions, healthStatusOptions, ownedByOptions]);
  
  // Get category name for display - memoize this function
  const getCategoryName = useCallback((filterKey) => {
    const categoryNames = {
      campus: 'Campus',
      type: 'Asset Type',
      status: 'Status',
      healthStatus: 'Health Status',
      ownedBy: 'Owned By',
    };
    return categoryNames[filterKey] || filterKey;
  }, []);

  // Setup summary cards — only health/maintenance status from /maintenance-history/count
  const healthStats = maintenanceCountData?.data?.byStatus || {};
  const totalMaintained = maintenanceCountData?.data?.total ?? data?.pagination?.totalCount ?? 0;

  const summaryCards = [
    { label: 'Total', filterKey: null, filterValue: null, value: totalMaintained, Icon: BarChart2, valueColor: 'text-gray-900', iconColor: 'text-gray-500' },
    { label: 'Healthy', filterKey: 'healthStatus', filterValue: 'HEALTHY', value: healthStats.HEALTHY ?? 0, Icon: CheckCircle, valueColor: 'text-green-600', iconColor: 'text-green-500' },
    { label: 'Service Due', filterKey: 'healthStatus', filterValue: 'SERVICE_DUE', value: healthStats.SERVICE_DUE ?? 0, Icon: Clock, valueColor: 'text-yellow-600', iconColor: 'text-yellow-500' },
    { label: 'Need Attention', filterKey: 'healthStatus', filterValue: 'NEED_ATTENTION', value: healthStats.NEED_ATTENTION ?? 0, Icon: AlertCircle, valueColor: 'text-red-600', iconColor: 'text-red-500' },
    { label: 'Inspection Due', filterKey: 'healthStatus', filterValue: 'INSPECTION_DUE', value: healthStats.INSPECTION_DUE ?? 0, Icon: Calendar, valueColor: 'text-orange-600', iconColor: 'text-orange-500' },
  ];

  const handleCardClick = (filterKey, filterValue) => {
    const newFilters = { ...filters };
    if (!filterKey) {
      delete newFilters.healthStatus;
    } else {
      newFilters.healthStatus = filterValue;
    }
    setFilters(newFilters);
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Transform API data to match table structure
  const assetsListData = useMemo(() => {
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
      const selectedCampusOpt = campusOptions.find(opt => opt.value === filters.campus);
      const campusName = selectedCampusOpt ? selectedCampusOpt.label : 'all';
      await exportToPDF(filters, visibleColumns, `assets-${campusName.toLowerCase().replace(/\s+/g, '-')}`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const selectedCampusOpt = campusOptions.find(opt => opt.value === filters.campus);
      const campusName = selectedCampusOpt ? selectedCampusOpt.label : 'all';
      await exportToCSV(filters, campusName);
    } catch (error) {
      console.error('CSV export failed:', error);
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
      
      case "healthStatus":
        return <StatusChip value={cellValue} colorFn={getHealthStatusChipColor} />;
        
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
      
      case "ownedBy":
        return <span className="font-medium text-gray-700 uppercase">{cellValue}</span>;
      
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
            onClick={() => { handleExportCSV(); setExportDropdownOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-gray-800 text-sm">Export as CSV</p>
              <p className="text-xs text-gray-500">Download all assets as CSV</p>
            </div>
          </button>
          
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
        showCreateButton={canCreateAsset}
        onCreateClick={handleCreateClick}
        showDashboardToggle={true}
        showCards={showCards}
        onToggleCards={() => setShowCards((prev) => !prev)}
        scrollKey="assets-list"
        summaryCardsComponent={showCards ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            {summaryCards.map((card) => (
              <SummaryCard
                key={card.label}
                label={card.label}
                value={card.value}
                Icon={card.Icon}
                valueColor={card.valueColor}
                iconColor={card.iconColor}
                clickable={true}
                onClick={() => handleCardClick(card.filterKey, card.filterValue)}
                isActive={card.filterKey === null ? !filters.healthStatus : filters.healthStatus === card.filterValue}
              />
            ))}
          </div>
        ) : null}
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
            healthStatusOptions={healthStatusOptions}
            ownedByOptions={ownedByOptions}
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