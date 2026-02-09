'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, ExternalLink, Eye, ChevronDown, Package, Truck } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import SearchInput from '@/components/molecules/SearchInput';
import ActionMenu from '@/components/molecules/ActionMenu';
import FormModal from '@/components/molecules/FormModal';
import CustomButton from '@/components/atoms/CustomButton';
import useFetch from '@/app/hooks/query/useFetch';
import { useQueryClient } from '@tanstack/react-query';
import post from '@/app/api/post/post';
import config from '@/app/config/env.config';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import {
  CONSIGNMENT_TABLE_ID,
  consignmentTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/consignmentTableConfig';
import { transformConsignmentForTable } from '@/app/utils/dataTransformers';
import { consignmentsListData, allocationsListData } from '@/dummyJson/dummyJson';
import {
  createConsignmentFields,
  readyToDispatchFields,
  addTransitFields,
  courierProviders,
} from '@/app/config/formConfigs/consignmentFormConfig';
import { toast } from '@/app/utils/toast';

const actionOptions = ['View', 'Details', 'Update Status'];

export default function ConsignmentsList() {
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
  
  // Status dropdown state
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
  
  // Asset list modal state
  const [openAssetListId, setOpenAssetListId] = useState(null);
  
  // Modal states for different actions
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
  const [currentConsignment, setCurrentConsignment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic form fields state for create modal
  const [createFormFields, setCreateFormFields] = useState(createConsignmentFields);
  
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
      setCurrentPage(1);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [searchInput]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openStatusDropdownId !== null) {
        setOpenStatusDropdownId(null);
      }
      if (openAssetListId !== null) {
        setOpenAssetListId(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openStatusDropdownId, openAssetListId]);
  
  // Build query string with pagination, filters, and search
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
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
    setCurrentPage(1);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
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
    { value: 'draft', label: 'Draft' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];
  
  // Get category name for filter key
  const getCategoryName = (filterKey) => {
    const categoryNames = {
      status: 'Status',
      courier: 'Courier Service',
      allocation: 'Allocation'
    };
    return categoryNames[filterKey] || filterKey;
  };
  
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
    let sourceData = (data && data.data) ? data.data : consignmentsListData;
    
    // Apply client-side filtering for dummy data
    if (!data || !data.data) {
      sourceData = sourceData.filter((consignment) => {
        // Filter by status
        if (filters.status && consignment.status !== filters.status) {
          return false;
        }
        
        // Filter by courier service
        if (filters.courier) {
          const courierServiceId = consignment.courierService?.id || consignment.courierServiceId;
          if (courierServiceId !== filters.courier && courierServiceId !== parseInt(filters.courier)) {
            return false;
          }
        }
        
        // Filter by allocation
        if (filters.allocation) {
          const allocationId = consignment.allocation?.id || consignment.allocationId;
          if (allocationId !== filters.allocation && allocationId !== parseInt(filters.allocation)) {
            return false;
          }
        }
        
        // Filter by search
        if (debouncedSearch) {
          const searchLower = debouncedSearch.toLowerCase();
          const searchableFields = [
            consignment.consignmentCode,
            consignment.code,
            consignment.trackingId,
            consignment.allocation?.allocationCode,
            consignment.allocationCode,
            consignment.source,
            consignment.destination,
            consignment.allocation?.sourceCampus?.name,
            consignment.allocation?.destinationCampus?.name,
          ].filter(Boolean);
          
          const matchesSearch = searchableFields.some(field => 
            String(field).toLowerCase().includes(searchLower)
          );
          
          if (!matchesSearch) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    return sourceData.map((consignment) => {
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
        courierServiceId: consignment.courierService?.id || consignment.courierServiceId || '',
        source: consignment.source || consignment.allocation?.sourceCampus?.name || '-',
        destination: consignment.destination || consignment.allocation?.destinationCampus?.name || '-',
        shippedAt: consignment.shippedAt ? new Date(consignment.shippedAt).toLocaleDateString() : '-',
        estimatedDeliveryDate: consignment.estimatedDeliveryDate ? new Date(consignment.estimatedDeliveryDate).toLocaleDateString() : '-',
        trackingId: consignment.trackingId || '-',
        trackingLink: consignment.trackingLink || '',
        assetCount: consignment.assets?.length || consignment.assetCount || 0,
        deliveredAt: consignment.deliveredAt ? new Date(consignment.deliveredAt).toLocaleDateString() : '-',
        createdBy: consignment.createdBy?.name || '-',
        createdAt: consignment.createdAt ? new Date(consignment.createdAt).toLocaleDateString() : '-',
        allocationId: consignment.allocation?.id || consignment.allocationId || '',
      };
    });
  }, [data, filters, debouncedSearch]);
  
  // Get pagination metadata
  const totalItems = data?.pagination?.total || data?.total || tableData.length;
  const totalPages = data?.pagination?.totalPages || Math.ceil(totalItems / pageSize) || 1;
  
  // Handle row click - navigate to details page
  const handleRowClick = (item) => {
    if (typeof window !== 'undefined') {
      const sourceData = (data && data.data) ? data.data : consignmentsListData;
      const fullConsignment = sourceData.find(c => c.id === item.id);
      if (fullConsignment) {
        sessionStorage.setItem('currentConsignmentData', JSON.stringify(fullConsignment));
      } else if (item.consignmentData) {
        sessionStorage.setItem('currentConsignmentData', JSON.stringify(item.consignmentData));
      }
    }
    router.push(`/consignments/${item.id}`);
  };
  
  // ============================================
  // MODAL HANDLERS
  // ============================================
  
  // Handle create consignment click
  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };
  
  // Handle create consignment submit
  const handleCreateConsignment = async (formData) => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Creating consignment...');
    
    try {
      const selectedAllocation = allocationsListData.find(
        alloc => alloc.id === parseInt(formData.allocationId) || alloc.id === formData.allocationId
      );
      
      if (!selectedAllocation) {
        throw new Error('Allocation not found');
      }
      
      const payload = {
        allocationId: formData.allocationId,
        assetIds: formData.assets,
        status: 'draft',
        source: formData.source,
        destination: formData.destination,
      };

      console.log('Creating consignment with payload:', payload);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss(loadingToastId);
      toast.success('Consignment created successfully with status: Draft');
      
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries(['consignments']);
      
    } catch (error) {
      console.error('Error creating consignment:', error);
      toast.dismiss(loadingToastId);
      toast.error(error?.message || 'Failed to create consignment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle dispatch
  const handleReadyToDispatch = (consignment) => {
    setCurrentConsignment(consignment);
    setIsDispatchModalOpen(true);
  };
  
  const handleDispatchConsignment = async (formData) => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Dispatching consignment...');
    
    try {
      const payload = {
        consignmentId: currentConsignment.id,
        courierServiceId: formData.courierServiceId,
        status: 'dispatched',
      };

      console.log('Dispatching consignment with payload:', payload);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss(loadingToastId);
      toast.success('Consignment dispatched successfully!');
      
      setIsDispatchModalOpen(false);
      setCurrentConsignment(null);
      queryClient.invalidateQueries(['consignments']);
      
    } catch (error) {
      console.error('Error dispatching consignment:', error);
      toast.dismiss(loadingToastId);
      toast.error(error?.message || 'Failed to dispatch consignment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle add transit
  const handleAddTransit = (consignment) => {
    setCurrentConsignment(consignment);
    setIsTransitModalOpen(true);
  };
  
  const handleStartTransit = async (formData) => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Starting transit...');
    
    try {
      const payload = {
        consignmentId: currentConsignment.id,
        trackingId: formData.trackingId,
        trackingLink: formData.trackingLink,
        status: 'in_transit',
      };

      console.log('Starting transit with payload:', payload);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss(loadingToastId);
      toast.success('Transit started successfully!');
      
      setIsTransitModalOpen(false);
      setCurrentConsignment(null);
      queryClient.invalidateQueries(['consignments']);
      
    } catch (error) {
      console.error('Error starting transit:', error);
      toast.dismiss(loadingToastId);
      toast.error(error?.message || 'Failed to start transit');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form data change in create modal to populate assets
  const handleCreateFormDataChange = (formData, field) => {
    if (field.name === 'allocationId' && formData.allocationId) {
      const selectedAllocation = allocationsListData.find(
        alloc => alloc.id === parseInt(formData.allocationId) || alloc.id === formData.allocationId
      );
      
      if (selectedAllocation) {
        const assets = selectedAllocation.assets || [];
        const source = selectedAllocation.sourceCampus?.name || '';
        const destination = selectedAllocation.destinationCampus?.name || '';
        
        const assetOptions = assets.map(asset => ({
          value: asset.id,
          label: asset.assetTag,
        }));
        
        setCreateFormFields(prev =>
          prev.map(f => {
            if (f.name === 'assets') {
              return { ...f, options: assetOptions };
            }
            if (f.name === 'source') {
              return { ...f, defaultValue: source };
            }
            if (f.name === 'destination') {
              return { ...f, defaultValue: destination };
            }
            return f;
          })
        );
      }
    }
  };
  
  const handleStatusChange = async (consignmentId, newStatus) => {
    try {
      setOpenStatusDropdownId(null);
      console.log(`Updating consignment ${consignmentId} status to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Show loading only on initial load
  const showLoading = isLoading && !consignmentsListData;

  // Error state
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
        
      case 'assetCount':
        const sourceData = (data && data.data) ? data.data : consignmentsListData;
        const fullConsignment = sourceData.find(c => c.id === item.id);
        const assets = fullConsignment?.assets || [];
        
        return (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenAssetListId(openAssetListId === item.id ? null : item.id);
              }}
              className="px-3 py-1 text-blue-600 hover:text-blue-800 font-medium cursor-pointer hover:underline"
            >
              {cellValue}
            </button>
            
            {openAssetListId === item.id && (
              <div className="absolute z-50 mt-1 left-0 w-64 bg-white rounded-md shadow-xl border border-gray-200">
                <div className="py-2 px-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-semibold text-sm text-gray-700">Asset Tags ({assets.length})</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {assets.length > 0 ? (
                    <div className="py-1">
                      {assets.map((asset, index) => (
                        <div
                          key={asset.id || index}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          {asset.assetTag}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No assets found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'status':
        const normalizedStatus = cellValue?.toLowerCase().replace(/\s+/g, '_');
        const statusColors = {
          'draft': 'bg-gray-100 text-gray-800 border border-gray-300',
          'dispatched': 'bg-amber-100 text-amber-800 border border-amber-300',
          'in_transit': 'bg-blue-100 text-blue-800 border border-blue-300',
          'delivered': 'bg-green-100 text-green-800 border border-green-300',
          'cancelled': 'bg-red-100 text-red-800 border border-red-300',
        };
        
        return (
          <div className="relative">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${statusColors[normalizedStatus] || 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
              {cellValue}
            </span>
          </div>
        );
        
      case 'actions':
        const normalizedItemStatus = item.status?.toLowerCase().replace(/\s+/g, '_');
        const menuOptions = [];
        
        // Always add Show Details option
        menuOptions.push({
          label: 'Show Details',
          icon: Eye,
          iconClassName: 'text-blue-600',
          onClick: () => {
            handleRowClick(item);
            setOpenMenuId(null);
          },
        });
        
        // Status-based action options
        if (normalizedItemStatus === 'draft') {
          menuOptions.push({
            label: 'Dispatch',
            icon: Package,
            iconClassName: 'text-green-600',
            onClick: () => {
              handleReadyToDispatch(item);
              setOpenMenuId(null);
            },
          });
        }
        
        if (normalizedItemStatus === 'dispatched') {
          menuOptions.push({
            label: 'Add Transit',
            icon: Truck,
            iconClassName: 'text-amber-600',
            onClick: () => {
              handleAddTransit(item);
              setOpenMenuId(null);
            },
          });
        }
        
        // Add Track option if tracking ID exists
        if (item.trackingId && item.trackingId !== '-') {
          menuOptions.push({
            label: 'Track Consignment',
            icon: ExternalLink,
            iconClassName: 'text-purple-600',
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

  // Get transit modal fields with pre-filled courier
  const getTransitModalFields = () => {
    if (!currentConsignment) return addTransitFields;
    
    const courierName = courierProviders.find(
      c => c.id === currentConsignment.courierServiceId
    )?.name || currentConsignment.courierService || 'Not Set';
    
    return addTransitFields.map(field => {
      if (field.name === 'courierServiceId') {
        return { ...field, defaultValue: courierName };
      }
      return field;
    });
  };

  return (
    <div className="space-y-6">
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
        key={`table-${openMenuId || 'none'}-${openStatusDropdownId || 'none'}-${openAssetListId || 'none'}`}
        data={tableData}
        columns={visibleColumns}
        title="Consignments"
        renderCell={renderCell}
        itemsPerPage={pageSize}
        showPagination={true}
        ariaLabel="Consignments table"
        showCreateButton={true}
        onCreateClick={handleCreateClick}
        isLoading={showLoading}
        searchComponent={
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search consignments..."
          />
        }
        filterComponent={
          <FilterDropdown
            statusOptions={statusOptions}
            selectedFilters={filters}
            onFilterChange={handleFilterChange}
          />
        }
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
        activeFiltersComponent={
          Object.keys(filters).length > 0 && (
            <ActiveFiltersChips
              filters={filters}
              getCategoryName={getCategoryName}
              getFilterLabel={getFilterLabel}
              onRemoveFilter={handleRemoveFilter}
            />
          )
        }
        serverPagination={true}
        paginationData={data?.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      
      {/* Create Consignment Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        componentName="Consignment"
        actionType="Create"
        fields={createFormFields}
        onSubmit={handleCreateConsignment}
        size="large"
        isSubmitting={isSubmitting}
        onFormDataChange={handleCreateFormDataChange}
      />
      
      {/* Dispatch Modal */}
      <FormModal
        isOpen={isDispatchModalOpen}
        onClose={() => {
          setIsDispatchModalOpen(false);
          setCurrentConsignment(null);
        }}
        componentName="Consignment"
        actionType="Dispatch"
        fields={readyToDispatchFields}
        onSubmit={handleDispatchConsignment}
        size="medium"
        isSubmitting={isSubmitting}
      />
      
      {/* Add Transit Modal */}
      <FormModal
        isOpen={isTransitModalOpen}
        onClose={() => {
          setIsTransitModalOpen(false);
          setCurrentConsignment(null);
        }}
        componentName="Consignment"
        actionType="Start Transit"
        fields={getTransitModalFields()}
        onSubmit={handleStartTransit}
        size="medium"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
