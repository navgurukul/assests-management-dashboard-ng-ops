'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Eye, ChevronDown, Package, Truck, ArrowLeftCircle } from 'lucide-react';
import { inTransitColumns, renderInTransitCell } from '@/features/consignments/InTransitReturns';
import { inTransitReturnsDummyData } from '@/dummyJson/dummyJson';
import TableWrapper from '@/components/Table/TableWrapper';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import SearchInput from '@/components/molecules/SearchInput';
import FormModal from '@/components/molecules/FormModal';
import Modal from '@/components/molecules/Modal';
import CustomButton from '@/components/atoms/CustomButton';
import StatusChip from '@/components/atoms/StatusChip';
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
import {
  createConsignmentFields,
  readyToDispatchFields,
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
  
  // Asset modal state
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  
  // Modal states for different actions
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [currentConsignment, setCurrentConsignment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // In-transit returns modal state
  const [showInTransit, setShowInTransit] = useState(false);
  const [inTransitSearch, setInTransitSearch] = useState('');

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
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openStatusDropdownId]);
  
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

  // Fetch campuses from API
  const { data: campusData } = useFetch({
    url: '/campuses',
    queryKey: ['campuses'],
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

  // Transform campus data from API to filter options
  const campusOptions = React.useMemo(() => {
    if (!campusData || !campusData.data) return [];
    
    return campusData.data.map((campus) => ({
      value: campus.id,
      label: campus.campusName || campus.name,
    }));
  }, [campusData]);

  // Update createFormFields when campus options are available
  useEffect(() => {
    if (campusOptions.length > 0) {
      setCreateFormFields(prev =>
        prev.map(field => {
          if (field.type === 'filter-group') {
            return { ...field, campusOptions };
          }
          return field;
        })
      );
    }
  }, [campusOptions]);
  
  // Status filter options - Only draft, dispatched, and delivered are supported
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' },
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
    const sourceData = Array.isArray(data?.data) ? data.data : [];
    
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
  }, [data]);
  
  // Get pagination metadata
  const totalItems = data?.pagination?.total || data?.total || tableData.length;
  const totalPages = data?.pagination?.totalPages || Math.ceil(totalItems / pageSize) || 1;

  // Filtered in-transit data (client-side search)
  const filteredInTransitData = React.useMemo(() => {
    if (!inTransitSearch.trim()) return inTransitReturnsDummyData;
    const q = inTransitSearch.toLowerCase();
    return inTransitReturnsDummyData.filter((row) =>
      row.consignmentCode.toLowerCase().includes(q) ||
      row.assetTag.toLowerCase().includes(q) ||
      row.model.toLowerCase().includes(q) ||
      row.userName.toLowerCase().includes(q) ||
      row.trackingId.toLowerCase().includes(q)
    );
  }, [inTransitSearch]);

  // Handle row click - navigate to details page
  const handleRowClick = (item) => {
    if (typeof window !== 'undefined') {
      const sourceData = Array.isArray(data?.data) ? data.data : [];
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
      // Validate that we have allocation and assets
      if (!formData.allocationId) {
        throw new Error('Please select an allocation');
      }
      
      if (!formData.selectedAssets || formData.selectedAssets.length === 0) {
        throw new Error('Please select at least one asset');
      }
      
      const payload = {
        allocationId: formData.allocationId,
        assetIds: formData.selectedAssets.map(asset => asset.id || asset.assetId),
        status: 'draft',
        source: formData.allocationDetails?.sourceCampus?.name || formData.allocationDetails?.source,
        destination: formData.allocationDetails?.destinationCampus?.name || formData.allocationDetails?.destination,
      };

      
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
  
  // Handle dispatch form data change to auto-populate tracking link
  const handleDispatchFormDataChange = (formData, field) => {
    let updatedFormData = { ...formData };
    
    // When courier service changes, auto-populate tracking link template
    if (field.name === 'courierServiceId' && formData.courierServiceId) {
      const selectedCourier = courierProviders.find(
        courier => courier.id === formData.courierServiceId
      );
      
      if (selectedCourier && selectedCourier.trackingUrlPattern) {
        // Replace {trackingId} with actual tracking ID if available
        let trackingLink = selectedCourier.trackingUrlPattern;
        if (formData.trackingId) {
          trackingLink = trackingLink.replace('{trackingId}', formData.trackingId);
        }
        updatedFormData.trackingLink = trackingLink;
      }
    }
    
    // When tracking ID changes, update the link if courier is selected
    if (field.name === 'trackingId' && formData.courierServiceId) {
      const selectedCourier = courierProviders.find(
        courier => courier.id === formData.courierServiceId
      );
      
      if (selectedCourier && selectedCourier.trackingUrlPattern) {
        // Replace {trackingId} with actual tracking ID
        let trackingLink = selectedCourier.trackingUrlPattern;
        if (formData.trackingId) {
          trackingLink = trackingLink.replace('{trackingId}', formData.trackingId);
        }
        updatedFormData.trackingLink = trackingLink;
      }
    }
    
    return updatedFormData;
  };
  
  const handleDispatchConsignment = async (formData) => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Dispatching consignment...');
    
    try {
      const payload = {
        courierServiceId: formData.courierServiceId,
        trackingId: formData.trackingId,
        trackingLink: formData.trackingLink || null,
        status: 'dispatched',
      };

      
      // Make API call to update consignment status to dispatched
      const response = await post(`/consignments/${currentConsignment.id}/dispatch`, payload);
      
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
  

  
  const handleStatusChange = async (consignmentId, newStatus) => {
    try {
      setOpenStatusDropdownId(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Show loading only on initial load
  const showLoading = isLoading && !data;

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
        const sourceData = Array.isArray(data?.data) ? data.data : [];
        const fullConsignment = sourceData.find(c => c.id === item.id) || item.consignmentData;
        const assets = fullConsignment?.assets || [];
        
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAssets(assets);
              setAssetModalOpen(true);
            }}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 font-medium cursor-pointer hover:underline"
          >
            {cellValue}
          </button>
        );
        
      case 'status':
        return (
          <div className="relative">
            <StatusChip value={cellValue} />
          </div>
        );
        
      case 'assignedTo':
        return (
          <div className="flex flex-col">
            <span className="text-sm text-gray-900">{item.assignedTo?.name || '-'}</span>
            <span className="text-xs text-gray-500">{item.assignedTo?.email || ''}</span>
          </div>
        );
        
      case 'actions':
        const normalizedItemStatus = item.status?.toLowerCase().replace(/\s+/g, '_');
        
        return (
          <div className="flex items-center justify-start gap-2 flex-wrap">
            {/* Dispatch button for draft status */}
            {normalizedItemStatus === 'draft' && (
              <CustomButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleReadyToDispatch(item);
                }}
                variant="success"
                size="sm"
                icon={Package}
                text="Dispatch"
                title="Dispatch consignment"
              />
            )}
            
            {/* Track button if tracking ID exists */}
            {item.trackingId && item.trackingId !== '-' && (
              <CustomButton
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(item.trackingId + ' tracking')}`, '_blank');
                }}
                variant="secondary"
                size="sm"
                icon={ExternalLink}
                text="Track"
                title="Track consignment"
              />
            )}
            
            {/* Show message if no actions available */}
            {normalizedItemStatus !== 'draft' && (!item.trackingId || item.trackingId === '-') && (
              <span className="text-xs text-gray-400">-</span>
            )}
          </div>
        );
        
      default:
        return cellValue;
    }
  };

  return (
    <div className="space-y-6">
      {showErrorBanner && !showInTransit && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Unable to load consignments:</strong> Please try again or check your network connection.
              </p>
            </div>
          </div>
        </div>
      )}

      <TableWrapper
        key={showInTransit ? 'transit' : `consignments-${openStatusDropdownId || 'none'}`}
        data={showInTransit ? filteredInTransitData : tableData}
        columns={showInTransit ? inTransitColumns : visibleColumns}
        title={showInTransit ? 'In-Transit Returns' : 'Consignments'}
        renderCell={showInTransit ? renderInTransitCell : renderCell}
        onRowClick={showInTransit ? undefined : handleRowClick}
        itemsPerPage={showInTransit ? 10 : pageSize}
        showPagination={true}
        ariaLabel={showInTransit ? 'In-transit returns table' : 'Consignments table'}
        showCreateButton={!showInTransit}
        onCreateClick={handleCreateClick}
        isLoading={showInTransit ? false : showLoading}
        searchComponent={
          showInTransit ? (
            <SearchInput
              value={inTransitSearch}
              onChange={setInTransitSearch}
              placeholder="Search by asset, user, tracking..."
            />
          ) : (
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search consignments..."
            />
          )
        }
        filterComponent={
          <>
            {!showInTransit && (
              <FilterDropdown
                statusOptions={statusOptions}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
              />
            )}
            <CustomButton
              text={showInTransit ? 'Back to Consignments' : 'In-Transit Returns'}
              icon={ArrowLeftCircle}
              onClick={() => setShowInTransit(!showInTransit)}
              variant={showInTransit ? 'secondary' : 'warning'}
              size="md"
            />
          </>
        }
        columnSelectorComponent={
          !showInTransit && (
            <ColumnSelector
              allColumns={allColumns}
              visibleColumnKeys={visibleColumnKeys}
              alwaysVisibleColumns={alwaysVisibleColumns}
              onToggleColumn={toggleColumn}
              onShowAll={showAllColumns}
              onReset={resetToDefault}
            />
          )
        }
        activeFiltersComponent={
          !showInTransit && Object.keys(filters).length > 0 && (
            <ActiveFiltersChips
              filters={filters}
              getCategoryName={getCategoryName}
              getFilterLabel={getFilterLabel}
              onRemoveFilter={handleRemoveFilter}
            />
          )
        }
        serverPagination={!showInTransit}
        paginationData={showInTransit ? null : data?.pagination}
        onPageChange={showInTransit ? undefined : handlePageChange}
        onPageSizeChange={showInTransit ? undefined : handlePageSizeChange}
      />
      
      {/* Create Consignment Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        actionType="Create"
        fields={createFormFields}
        onSubmit={handleCreateConsignment}
        size="large"
        isSubmitting={isSubmitting}
        helpText="Select an allocation and choose assets to create a new consignment"
      />
      
      {/* Dispatch Modal */}
      <FormModal
        isOpen={isDispatchModalOpen}
        onClose={() => {
          setIsDispatchModalOpen(false);
          setCurrentConsignment(null);
        }}
        actionType="Dispatch"
        fields={readyToDispatchFields}
        onSubmit={handleDispatchConsignment}
        size="medium"
        isSubmitting={isSubmitting}
        onFormDataChange={handleDispatchFormDataChange}
        helpText="Enter courier partner details and tracking information to dispatch the consignment"
      />
      
      {/* Asset List Modal */}
      <Modal
        isOpen={assetModalOpen}
        onClose={() => {
          setAssetModalOpen(false);
          setSelectedAssets([]);
        }}
        title={`Asset Tags (${selectedAssets.length})`}
        size="medium"
      >
        <div className="max-h-96 overflow-y-auto">
          {selectedAssets.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {selectedAssets.map((asset, index) => (
                <div
                  key={asset.id || index}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{asset.assetTag}</span>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No assets found</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
