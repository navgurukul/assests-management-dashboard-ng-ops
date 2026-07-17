'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusChip from '@/components/atoms/StatusChip';
import { getConditionChipColor } from '@/app/utils/statusHelpers';
import TableWrapper from '@/components/Table/TableWrapper';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import CustomButton from '@/components/atoms/CustomButton';
import SearchInput from '@/components/molecules/SearchInput';
import ActionMenu from '@/components/molecules/ActionMenu';
import FormModal from '@/components/molecules/FormModal';
import useFetch from '@/app/hooks/query/useFetch';
import { useQueryClient } from '@tanstack/react-query';
import post from '@/app/api/post/post';
import config from '@/app/config/env.config';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import { useFilterHandlers } from '@/app/hooks/useFilterHandlers';
import { usePersistentState } from '@/app/hooks/usePersistentState';
import {
  COMPONENT_TABLE_ID,
  componentTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/componentTableConfig';
import { transformComponentForTable } from '@/app/utils/dataTransformers';
import { getFieldsByActionType } from '@/app/config/formConfigs/componentActionFormConfig';
import { getComponentMenuOptions } from '@/app/config/componentMenuOptions';
import { toast } from '@/app/utils/toast';

const actionOptions = ['View', 'Details'];
const STORAGE_KEY = 'componentFormData';

export default function ComponentsList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Pagination state (persisted)
  const [paginationState, setPaginationState] = usePersistentState('components-pagination', { currentPage: 1, pageSize: 20 });
  const { currentPage, pageSize } = paginationState;
  
  // Filter state (persisted)
  const [filters, setFilters] = usePersistentState('components-filters', {});
  
  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [currentComponent, setCurrentComponent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Clear component form data from sessionStorage when user navigates to components list
  useEffect(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing form data from sessionStorage:', error);
    }
  }, []);
  
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
  
  // Column visibility management
  const {
    visibleColumns,
    visibleColumnKeys,
    allColumns,
    toggleColumn,
    showAllColumns,
    resetToDefault,
    alwaysVisibleColumns,
  } = useTableColumns(COMPONENT_TABLE_ID, componentTableColumns, defaultVisibleColumns);
  
  // Build query string with pagination, filters, and search
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    // Add search parameter first
    if (debouncedSearch) params.append('search', debouncedSearch);
    
    params.append('page', currentPage);
    params.append('limit', pageSize);
    
    if (filters.campus) params.append('campusId', filters.campus);
    if (filters.componentType) params.append('assetTypeId', filters.componentType);
    if (filters.source) params.append('source', filters.source);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.status) params.append('status', filters.status);
    
    return params.toString();
  };
  
  // Fetch components data from API with pagination, filters, and search
  const { data, isLoading, isError, error } = useFetch({
    url: `/components?${buildQueryString()}`,
    queryKey: ['components', currentPage, pageSize, filters, debouncedSearch],
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
  const campusOptions = React.useMemo(() => {
    if (!campusData || !campusData.data) return [];
    
    return campusData.data.map((campus) => ({
      value: campus.id,
      label: campus.campusName,
    }));
  }, [campusData]);
  
  // Transform asset types data to component type filter options (only COMPONENT category)
  const componentTypeOptions = React.useMemo(() => {
    if (!assetTypesData || !assetTypesData.data) return [];
    
    // Filter only items with category "COMPONENT"
    return assetTypesData.data
      .filter((assetType) => assetType.assetCategory?.name === 'Components')
      .map((assetType) => ({
        value: assetType.id,
        label: assetType.name,
      }));
  }, [assetTypesData]);
  
  // Source filter options
  const sourceOptions = [
    { value: 'NEW_PURCHASE', label: 'New Purchase' },
    { value: 'EXTRACTED', label: 'Extracted' },
  ];
  
  // Condition filter options
  const conditionOptions = [
    { value: 'NEW', label: 'New' },
    { value: 'LIKE_NEW', label: 'Like New' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' },
    { value: 'NOT_WORKING', label: 'Not Working' },
  ];
  
  // Status filter options
  const statusFilterOptions = [
    { value: 'IN_STOCK', label: 'In Stock' },
    { value: 'INSTALLED', label: 'Installed' },
    { value: 'REPAIR', label: 'Repair' },
    { value: 'SCRAP', label: 'Scrap' },
    { value: 'SOLD', label: 'Sold' },
    { value: 'LOST', label: 'Lost' },
  ];
  
  // Get label for a filter value
  const getFilterLabel = (filterKey, value) => {
    if (filterKey === 'campus') {
      const campus = campusOptions.find(opt => opt.value === value);
      return campus ? campus.label : value;
    }
    if (filterKey === 'componentType') {
      const componentType = componentTypeOptions.find(opt => opt.value === value);
      return componentType ? componentType.label : value;
    }
    if (filterKey === 'source') {
      const source = sourceOptions.find(opt => opt.value === value);
      return source ? source.label : value;
    }
    if (filterKey === 'condition') {
      const condition = conditionOptions.find(opt => opt.value === value);
      return condition ? condition.label : value;
    }
    if (filterKey === 'status') {
      const status = statusFilterOptions.find(opt => opt.value === value);
      return status ? status.label : value;
    }
    return value;
  };
  
  // Get category name for display
  const getCategoryName = (filterKey) => {
    const categoryNames = {
      campus: 'Campus',
      componentType: 'Component Type',
      source: 'Source',
      condition: 'Condition',
      status: 'Status'
    };
    return categoryNames[filterKey] || filterKey;
  };

  // Transform API data to match table structure
  const componentsListData = React.useMemo(() => {
    if (!data || !data.data || !data.data.items) return [];
    
    return data.data.items.map((component) => ({
      ...transformComponentForTable(component),
      actions: actionOptions[0], // Default to 'View'
    }));
  }, [data]);

  // Handle opening the action modal
  const handleOpenActionModal = (actionType, component) => {
    setCurrentAction(actionType);
    setCurrentComponent(component);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAction(null);
    setCurrentComponent(null);
    setIsSubmitting(false);
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    let loadingToastId = null;

    try {
      if (currentAction?.toUpperCase() === 'INSTALL') {
        const componentId = currentComponent?.id;
        if (!componentId) {
          toast.error('Component ID is missing.');
          return;
        }
        if (!formData.deviceId) {
          toast.error('Please select a device.');
          return;
        }

        loadingToastId = toast.loading('Installing component...');

        const installPayload = {
          assetId: formData.deviceId,
          slotLabel: formData.slotLabel || '',
          installationDate: formData.date || new Date().toISOString().split('T')[0],
          notes: formData.notes?.trim() || (formData.person ? `Installed by: ${formData.person}` : ''),
        };

        const installUrl = config.getApiUrl(config.endpoints.components.install(componentId));
        await post({ url: installUrl, method: 'POST', data: installPayload });

        toast.dismiss(loadingToastId);
        loadingToastId = null;
        queryClient.invalidateQueries({ queryKey: ['components'] });
        toast.success('Install action completed successfully!');
        handleCloseModal();
      } else {
        // Non-Install actions: simulate API call for now
        loadingToastId = toast.loading(`${currentAction} in progress...`);
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.dismiss(loadingToastId);
        loadingToastId = null;
        toast.success(`${currentAction} action completed successfully!`);
        handleCloseModal();
      }
    } catch (error) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      console.error('Error submitting form:', error);
      const errorMessage = error?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "componentTag":
        return <span className="font-medium text-gray-900">{cellValue}</span>;
      
      case "status":
        return <StatusChip value={cellValue} />;
      
      case "condition":
        return <StatusChip value={cellValue} colorFn={getConditionChipColor} />;
      
      case "actions": {
        const menuOptions = getComponentMenuOptions(handleOpenActionModal, item);

        return (
          <ActionMenu menuOptions={menuOptions} />
        );
      }
      
      default:
        return <span className="text-gray-700">{cellValue}</span>;
    }
  };

  const handleRowClick = (component) => {
    router.push(`/components/${component.id}`);
  };

  const handleCreateClick = () => {
    router.push('/components/create');
  };

  // Loading state - only show full-page loader on initial load (when no data exists)
  const isInitialLoad = isLoading && !data;
  
  

  // Error state - only show full-page error on initial load
  if (isError && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading components</p>
          <p className="text-gray-600 mt-2">{error?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        componentName={currentComponent?.componentTag || ''}
        actionType={currentAction || ''}
        fields={getFieldsByActionType(currentAction, currentComponent?.componentData)}
        onSubmit={handleFormSubmit}
        size="medium"
        isSubmitting={isSubmitting}
        componentData={currentComponent?.componentData || null}
      />

      {/* Table */} 
      <TableWrapper
        data={componentsListData}
        columns={visibleColumns}
        title="Components"
        renderCell={renderCell}
        itemsPerPage={pageSize}
        showPagination={true}
        ariaLabel="Components table"
        onRowClick={handleRowClick}
        showCreateButton={true}
        onCreateClick={handleCreateClick}
        scrollKey="components-list"
        // Loading state
        isLoading={isLoading}
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
            componentTypeOptions={componentTypeOptions}
            sourceOptions={sourceOptions}
            conditionOptions={conditionOptions}
            statusOptions={statusFilterOptions}
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
        // Server-side pagination props
        serverPagination={true}
        paginationData={data?.data?.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      </div> 
  );
}
