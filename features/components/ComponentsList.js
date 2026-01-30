'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
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
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to first page when search changes
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
  
  // Transform asset types data to component type filter options (only COMPONENT category)
  const componentTypeOptions = React.useMemo(() => {
    if (!assetTypesData || !assetTypesData.data) return [];
    
    // Filter only items with category "COMPONENT"
    return assetTypesData.data
      .filter((assetType) => assetType.category === 'COMPONENT')
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
    { value: 'GOOD', label: 'Good' },
    { value: 'WORKING', label: 'Working' },
    { value: 'DAMAGED', label: 'Damaged' },
    { value: 'FAULTY', label: 'Faulty' },
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

  const handleViewDetails = React.useCallback((componentId) => {
    // Find the full component data
    const component = componentsListData.find(comp => comp.id === componentId);
    if (component && component.componentData) {
      // Store component data in sessionStorage for details page
      sessionStorage.setItem('currentComponentData', JSON.stringify(component.componentData));
    }
    router.push(`/components/${componentId}`);
  }, [componentsListData, router]);

  // Handle opening the action modal
  const handleOpenActionModal = React.useCallback((actionType, component) => {
    setCurrentAction(actionType);
    setCurrentComponent(component);
    setIsModalOpen(true);
    setOpenMenuId(null); // Close the action menu
  }, []);

  // Handle closing the modal
  const handleCloseModal = React.useCallback(() => {
    setIsModalOpen(false);
    setCurrentAction(null);
    setCurrentComponent(null);
    setIsSubmitting(false);
  }, []);

  // Handle form submission
  const handleFormSubmit = React.useCallback(async (formData) => {
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
        console.log('Form submitted:', {
          action: currentAction,
          componentId: currentComponent?.id,
          componentTag: currentComponent?.componentTag,
          formData,
        });
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
  }, [currentAction, currentComponent, handleCloseModal, queryClient]);

  const renderCell = React.useCallback((item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "componentTag":
        return (
          <button 
            onClick={() => handleViewDetails(item.id)}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            {cellValue}
          </button>
        );
      
      case "status":
        const statusColors = {
          'In Stock': 'bg-blue-100 text-blue-800',
          'Installed': 'bg-green-100 text-green-800',
          'Scrap': 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      
      case "condition":
        const conditionColors = {
          'New': 'bg-green-100 text-green-800',
          'Working': 'bg-blue-100 text-blue-800',
          'Damaged': 'bg-orange-100 text-orange-800',
          'Faulty': 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-3 py-1 rounded text-xs font-medium ${conditionColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      
      case "actions":
        const menuOptions = getComponentMenuOptions(handleOpenActionModal, item);

        
        return (
          <div className="relative flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();setOpenMenuId(openMenuId === item.id ? null : item.id);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Actions menu"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
            {openMenuId === item.id && (
              <>
                {console.log('Rendering ActionMenu for item:', item.id)}
                <ActionMenu
                  menuOptions={menuOptions}
                  onClose={() => {
                    console.log('Closing menu');
                    setOpenMenuId(null);
                  }}
                />
              </>
            )}
          </div>
        );
      
      default:
        return <span className="text-gray-700">{cellValue}</span>;
    }
  }, [openMenuId, handleViewDetails, handleOpenActionModal]);

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
        key={`table-${openMenuId || 'none'}`}
        data={componentsListData}
        columns={visibleColumns}
        title="Components"
        renderCell={renderCell}
        itemsPerPage={pageSize}
        showPagination={true}
        ariaLabel="Components table"
        showCreateButton={true}
        onCreateClick={handleCreateClick}
        // Loading state
        isLoading={isLoading}
        // Search component
        searchComponent={
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search components..."
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
