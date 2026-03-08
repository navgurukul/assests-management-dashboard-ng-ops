'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Eye, ChevronDown, Package, Truck, ArrowLeftCircle, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import ActionMenu from '@/components/molecules/ActionMenu';
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
import config from '@/app/config/env.config';
import apiService from '@/app/utils/apiService';
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
  getAcceptReturnFields,
} from '@/app/config/formConfigs/consignmentFormConfig';
import { toast } from '@/app/utils/toast';

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
  
  // In-transit action menu state
  const [openInTransitMenuId, setOpenInTransitMenuId] = useState(null);

  // Accept return modal state
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [currentInTransitItem, setCurrentInTransitItem] = useState(null);
  const [isAcceptSubmitting, setIsAcceptSubmitting] = useState(false);

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
  const { data, isLoading, isError, error, refetch: refetchConsignments } = useFetch({
    url: `/consignments?${buildQueryString()}`,
    queryKey: ['consignments', currentPage, pageSize, filters, debouncedSearch],
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
  
  // Use static courier providers for filter options
  const courierOptions = React.useMemo(() => {
    return courierProviders.map((courier) => ({
      value: courier.id,
      label: courier.name,
    }));
  }, []);

  // Transform campus data from API to filter options
  const campusOptions = React.useMemo(() => {
    if (!campusData || !campusData.data) return [];
    
    return campusData.data.map((campus) => ({
      value: campus.id,
      label: campus.campusName || campus.name,
    }));
  }, [campusData]);

  const campusNameById = React.useMemo(() => {
    const map = new Map();
    const campuses = Array.isArray(campusData?.data) ? campusData.data : [];

    campuses.forEach((campus) => {
      const campusId = String(campus?.id || '').trim();
      const campusName = campus?.campusName || campus?.name || '';
      if (campusId && campusName) {
        map.set(campusId, campusName);
      }
    });

    return map;
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

  const isLikelyId = (value) => {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    return /^[a-f0-9-]{16,}$/i.test(trimmed) && !/\s/.test(trimmed);
  };

  const isPlaceholder = (value) => {
    if (value === null || value === undefined) return true;
    const normalized = String(value).trim().toUpperCase();
    return normalized === '' || normalized === 'N/A' || normalized === 'NA' || normalized === '-';
  };

  const resolveConsignmentLocationLabel = (baseValue, objectCandidate, idCandidate) => {
    const candidates = [baseValue, objectCandidate, idCandidate];

    for (const candidate of candidates) {
      if (!candidate) continue;

      if (typeof candidate === 'object') {
        const objectName = candidate.campusName || candidate.name;
        if (!isPlaceholder(objectName)) {
          return objectName;
        }

        const objectId = String(candidate.id || candidate.campusId || '').trim();
        if (objectId && campusNameById.has(objectId)) {
          return campusNameById.get(objectId);
        }

        continue;
      }

      const value = String(candidate).trim();
      if (isPlaceholder(value)) continue;

      if (campusNameById.has(value)) {
        return campusNameById.get(value);
      }

      if (!isLikelyId(value)) {
        return value;
      }
    }

    return 'N/A';
  };
  
  // Process API data to table format
  const tableData = React.useMemo(() => {
    const sourceData = Array.isArray(data?.data) ? data.data : [];
    
    return sourceData.map((consignment) => {
      if (typeof transformConsignmentForTable === 'function') {
        const transformed = transformConsignmentForTable(consignment);

        const resolvedSource = resolveConsignmentLocationLabel(
          transformed?.source,
          consignment?.sourceCampus || consignment?.sourceLocation || consignment?.allocation?.sourceCampus,
          consignment?.sourceCampusId || consignment?.sourceLocationId || consignment?.allocation?.sourceCampusId
        );

        const resolvedDestination = resolveConsignmentLocationLabel(
          transformed?.destination,
          consignment?.destinationCampus || consignment?.destinationLocation || consignment?.allocation?.destinationCampus,
          consignment?.destinationCampusId || consignment?.destinationLocationId || consignment?.allocation?.destinationCampusId
        );

        return {
          ...transformed,
          source: resolvedSource,
          destination: resolvedDestination,
        };
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
  }, [data, campusNameById]);
  
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
      const isPlaceholderValue = (value) => {
        if (value === null || value === undefined) return true;
        const normalized = String(value).trim().toUpperCase();
        return normalized === '' || normalized === 'N/A' || normalized === 'NA' || normalized === '-';
      };

      const isLikelyCampusId = (value) => {
        if (typeof value !== 'string') return false;
        const trimmedValue = value.trim();
        if (!trimmedValue) return false;
        return /^[a-f0-9-]{16,}$/i.test(trimmedValue) && !/\s/.test(trimmedValue);
      };

      const resolveCampusName = (...candidates) => {
        for (const candidate of candidates) {
          if (!candidate) continue;

          if (typeof candidate === 'object') {
            const objectName = candidate.campusName || candidate.name;
            if (!isPlaceholderValue(objectName) && !isLikelyCampusId(String(objectName))) {
              return objectName;
            }

            const objectId = String(candidate.id || candidate.campusId || '').trim();
            if (objectId && campusNameById.has(objectId)) {
              return campusNameById.get(objectId);
            }

            continue;
          }

          const value = String(candidate).trim();
          if (isPlaceholderValue(value)) continue;

          if (campusNameById.has(value)) {
            return campusNameById.get(value);
          }

          if (!isLikelyCampusId(value)) {
            return value;
          }
        }

        return '';
      };

      const selectedAllocationRecord = allAllocations.find(
        (allocation) => String(allocation?.id) === String(formData.allocationId)
      );

      const sourceCampusName = resolveCampusName(
        selectedAllocationRecord?.sourceCampus,
        selectedAllocationRecord?.sourceCampusId,
        selectedAllocationRecord?.sourceCampusName,
        selectedAllocationRecord?.source,
        formData.allocationDetails?.sourceCampus,
        formData.allocationDetails?.sourceCampusId,
        formData.allocationDetails?.sourceCampusName,
        formData.allocationDetails?.source
      );

      const destinationCampusName = resolveCampusName(
        selectedAllocationRecord?.destinationCampus,
        selectedAllocationRecord?.destinationCampusId,
        selectedAllocationRecord?.destinationCampusName,
        selectedAllocationRecord?.destination,
        formData.allocationDetails?.destinationCampus,
        formData.allocationDetails?.destinationCampusId,
        formData.allocationDetails?.destinationCampusName,
        formData.allocationDetails?.destination
      );

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
        source: sourceCampusName,
        destination: destinationCampusName,
      };

      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss(loadingToastId);
      toast.success('Consignment created successfully with status: Draft');
      
      setIsCreateModalOpen(false);
      
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
    return formData;
  };
  
  const handleDispatchConsignment = async (formData) => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Dispatching consignment...');
    
    try {
      const selectedCourier = courierProviders.find(
        (courier) => courier.id === formData.courierServiceId
      );

      const payload = {
        courierPartnerName: selectedCourier?.name || String(formData.courierServiceId || ''),
        trackingId: formData.trackingId,
        link: formData.trackingLink || 'https://www.shiprocket.in/shipment-tracking/',
      };

      
      // Make API call to update consignment status to dispatched
      await apiService.patch(
        config.endpoints.consignments?.dispatch?.(currentConsignment.id) ||
          `/consignments/${currentConsignment.id}/dispatch`,
        payload
      );
      
      toast.dismiss(loadingToastId);
      toast.success('Consignment dispatched successfully!');

      // Refresh list so updated status is reflected in the table immediately
      await refetchConsignments();
      
      setIsDispatchModalOpen(false);
      setCurrentConsignment(null);
      
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

  // Accept return form fields (built dynamically so campusOptions are available)
  const acceptReturnFields = React.useMemo(
    () => getAcceptReturnFields(campusOptions),
    [campusOptions]
  );

  // Handle accept return form submit
  const handleAcceptSubmit = async (formData) => {
    setIsAcceptSubmitting(true);
    const loadingToastId = toast.loading('Processing acceptance...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.dismiss(loadingToastId);
      toast.success(`Return accepted for ${currentInTransitItem?.assetTag}`);
      setIsAcceptModalOpen(false);
      setCurrentInTransitItem(null);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error(error?.message || 'Failed to accept return');
    } finally {
      setIsAcceptSubmitting(false);
    }
  };

  // In-transit action handlers
  const handleInTransitAction = React.useCallback((action, item) => {
    setOpenInTransitMenuId(null);
    if (action === 'Accepted') {
      setCurrentInTransitItem(item);
      setIsAcceptModalOpen(true);
    } else {
      toast.success(`Marked as ${action}: ${item.assetTag}`);
    }
  }, []);

  // Render cell for in-transit table (with actions column)
  const renderInTransitCellWithActions = React.useCallback((item, columnKey) => {
    if (columnKey === 'actions') {
      const menuOptions = [
        {
          label: 'Accepted',
          icon: CheckCircle,
          iconClassName: 'text-green-600',
          onClick: () => handleInTransitAction('Accepted', item),
        },
        {
          label: 'Rejected',
          icon: XCircle,
          iconClassName: 'text-red-500',
          onClick: () => handleInTransitAction('Rejected', item),
        },
      ];

      return (
        <div className="relative flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenInTransitMenuId(openInTransitMenuId === item.id ? null : item.id);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Actions menu"
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
          {openInTransitMenuId === item.id && (
            <ActionMenu
              menuOptions={menuOptions}
              onClose={() => setOpenInTransitMenuId(null)}
            />
          )}
        </div>
      );
    }
    return renderInTransitCell(item, columnKey);
  }, [openInTransitMenuId, handleInTransitAction]);

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
        const canTrack =
          normalizedItemStatus === 'dispatched' &&
          item.trackingId &&
          item.trackingId !== '-';
        
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
            
            {/* Track button only for dispatched status */}
            {canTrack && (
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
            {normalizedItemStatus !== 'draft' && !canTrack && (
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
        key={showInTransit ? `transit-${openInTransitMenuId || 'none'}` : `consignments-${openStatusDropdownId || 'none'}`}
        data={showInTransit ? filteredInTransitData : tableData}
        columns={showInTransit ? inTransitColumns : visibleColumns}
        title={showInTransit ? 'In-Transit Returns' : 'Consignments'}
        renderCell={showInTransit ? renderInTransitCellWithActions : renderCell}
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
          <CustomButton
              text={showInTransit ? 'Back to Consignments' : 'In-Transit Returns'}
              icon={ArrowLeftCircle}
              onClick={() => setShowInTransit(!showInTransit)}
              variant={showInTransit ? 'secondary' : 'warning'}
              size="md"
            />
            {!showInTransit && (
              <FilterDropdown
                statusOptions={statusOptions}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
              />
            )}
            
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
      
      {/* Accept Return Modal */}
      <FormModal
        isOpen={isAcceptModalOpen}
        onClose={() => {
          setIsAcceptModalOpen(false);
          setCurrentInTransitItem(null);
        }}
        actionType="Accept Return"
        componentName={currentInTransitItem?.assetTag || ''}
        fields={acceptReturnFields}
        onSubmit={handleAcceptSubmit}
        size="medium"
        isSubmitting={isAcceptSubmitting}
        helpText={`Asset: ${currentInTransitItem?.assetTag || ''} — ${currentInTransitItem?.model || ''}`}
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
