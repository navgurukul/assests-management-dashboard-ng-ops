'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Eye, ChevronDown, Package, Truck, ArrowLeftCircle, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import ActionMenu from '@/components/molecules/ActionMenu';
import { inTransitColumns, renderInTransitCell } from '@/features/consignments/InTransitReturns';
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
import usePatch from '@/app/hooks/query/usePatch';
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
  getAcceptReturnFields,
} from '@/app/config/formConfigs/consignmentFormConfig';
import { toast } from '@/app/utils/toast';
import GenericCellRenderer from '@/components/Table/GenericCellRenderer';

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
  const [debouncedInTransitSearch, setDebouncedInTransitSearch] = useState('');
  const [inTransitPage, setInTransitPage] = useState(1);
  const [inTransitPageSize, setInTransitPageSize] = useState(10);
  
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
  
  // Debounce main search input (800ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Debounce in-transit search input (800ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInTransitSearch(inTransitSearch);
      setInTransitPage(1);
    }, 800);

    return () => clearTimeout(timer);
  }, [inTransitSearch]);
  
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
  
  // Build in-transit query string
  const buildInTransitQueryString = () => {
    const params = new URLSearchParams();
    params.append('page', inTransitPage);
    params.append('limit', inTransitPageSize);
    if (debouncedInTransitSearch) params.append('search', debouncedInTransitSearch);
    return params.toString();
  };

  // Fetch in-transit returns from API
  const {
    data: inTransitData,
    isLoading: isInTransitLoading,
    isError: isInTransitError,
    refetch: refetchInTransit,
  } = useFetch({
    url: `${config.endpoints.consignmentReturnAssets?.list || '/consignment/assets/return'}?${buildInTransitQueryString()}`,
    queryKey: ['inTransitReturns', inTransitPage, inTransitPageSize, debouncedInTransitSearch],
    enabled: showInTransit,
  });

  // Fetch consignments data from API with pagination, filters, and search
  const { data, isLoading, isError, error, refetch: refetchConsignments } = useFetch({
    url: `/consignments?${buildQueryString()}`,
    queryKey: ['consignments', currentPage, pageSize, filters, debouncedSearch],
  });

  const acceptReturnCampusId = React.useMemo(() => {
    if (!isAcceptModalOpen || !currentInTransitItem) return null;

    return (
      currentInTransitItem?.storedCampusId ||
      currentInTransitItem?.action?.storedCampusId ||
      currentInTransitItem?.campusId ||
      currentInTransitItem?.campus?.id ||
      currentInTransitItem?.allocation?.campus?.id ||
      null
    );
  }, [isAcceptModalOpen, currentInTransitItem]);

  const {
    data: campusLocationsData,
    isError: isCampusLocationsError,
  } = useFetch({
    url: acceptReturnCampusId
      ? config.endpoints.locations?.byCampus?.(acceptReturnCampusId)
      : '/locations/campus/invalid',
    queryKey: ['campusLocations', acceptReturnCampusId],
    enabled: Boolean(acceptReturnCampusId),
  });

  const { mutateAsync: patchMutation } = usePatch();

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

  const campusNameById = React.useMemo(() => {
    const map = new Map();
    const consignments = Array.isArray(data?.data) ? data.data : [];

    consignments.forEach((consignment) => {
      const campuses = [
        consignment?.sourceLocation?.campus,
        consignment?.destinationLocation?.campus,
      ];

      campuses.forEach((campus) => {
        const campusId = String(campus?.id || '').trim();
        const campusName = campus?.campusName || campus?.name || '';
        if (campusId && campusName) {
          map.set(campusId, campusName);
        }
      });
    });

    return map;
  }, [data]);

  const campusOptions = React.useMemo(() => {
    return Array.from(campusNameById.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [campusNameById]);

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

  const resolveConsignmentLocationLabel = (location) => {
    const campusName = location?.campus?.name;
    if (campusName) {
      return campusName;
    }

    const campusId = location?.campus?.id;
    if (campusId && campusNameById.has(campusId)) {
      return campusNameById.get(campusId);
    }

    return 'N/A';
  };

  const extractTrackingUrl = (consignment) => {
    const directUrl = String(consignment?.trackingLink || consignment?.link || '').trim();
    if (directUrl) {
      return directUrl;
    }

    const notes = String(consignment?.notes || '').trim();
    const urlMatch = notes.match(/https?:\/\/[^\s]+/i);
    return urlMatch ? urlMatch[0] : '';
  };
  
  // Process API data to table format
  const tableData = React.useMemo(() => {
    const sourceData = Array.isArray(data?.data) ? data.data : [];
    
    return sourceData.map((consignment) => {
      if (typeof transformConsignmentForTable === 'function') {
        const transformed = transformConsignmentForTable(consignment);

        const resolvedSource = resolveConsignmentLocationLabel(consignment?.sourceLocation);

        const resolvedDestination = resolveConsignmentLocationLabel(consignment?.destinationLocation);

        return {
          ...transformed,
          source: resolvedSource,
          destination: resolvedDestination,
          trackingLink: extractTrackingUrl(consignment) || transformed?.trackingLink || '',
        };
      }
      
      // Default formatting
      return {
        id: consignment.id,
        consignmentCode: consignment.consignmentCode || `CON-${consignment.id}`,
        status: consignment.status,
        allocationCode: consignment.allocation?.allocationCode || '-',
        courierService: consignment.courierPartnerName || consignment.courierName || '-',
        courierServiceId: consignment.courierService?.id || '',
        source: resolveConsignmentLocationLabel(consignment.sourceLocation),
        destination: resolveConsignmentLocationLabel(consignment.destinationLocation),
        shippedAt: consignment.shippedAt ? new Date(consignment.shippedAt).toLocaleDateString() : '-',
        estimatedDeliveryDate: consignment.estimatedDeliveryDate ? new Date(consignment.estimatedDeliveryDate).toLocaleDateString() : '-',
        trackingId: consignment.trackingNumber || '-',
        trackingLink: extractTrackingUrl(consignment),
        assetCount: consignment.assetCount ?? 0,
        deliveredAt: consignment.receivedAt ? new Date(consignment.receivedAt).toLocaleDateString() : '-',
        createdBy:
          `${consignment.createdBy?.firstName || ''} ${consignment.createdBy?.lastName || ''}`.trim() ||
          consignment.createdBy?.email ||
          '-',
        createdAt: consignment.createdAt ? new Date(consignment.createdAt).toLocaleDateString() : '-',
        allocationId: consignment.allocation?.id || '',
      };
    });
  }, [data, campusNameById]);
  
  // Get pagination metadata
  const totalItems = data?.pagination?.total || data?.total || tableData.length;
  const totalPages = data?.pagination?.totalPages || Math.ceil(totalItems / pageSize) || 1;

  // Map API in-transit data to table row shape
  const inTransitTableData = React.useMemo(() => {
    const nestedRows = inTransitData?.data?.data;
    const flatRows = inTransitData?.data;
    const source = Array.isArray(nestedRows)
      ? nestedRows
      : Array.isArray(flatRows)
      ? flatRows
      : [];

    return source.map((row) => ({
      ...row,
      id: row.id || row.action?.consignmentAssetId || row.assetTag,
      consignmentId: row.consignmentId || row.action?.consignmentId || row.consignment?.id || '',
      consignmentCode: row.consignmentCode || row.consignment || '-',
      assetId:
        row.assetId ||
        row.action?.assetId ||
        row.asset?.id ||
        '',
      assetTag: row.assetTag || '-',
      model: row.laptopModel || row.model || row.asset?.model || '-',
      userName: row.returnByUserEmail || row.returnedBy || '-',
      userEmail: row.returnByUserEmail || row.userEmail || '',
      trackingId: row.trackingNumber || row.trackingId || '-',
      estimatedArrival: row.expectedDeliveryDate || row.estArrivalDate
        ? new Date(row.expectedDeliveryDate || row.estArrivalDate).toLocaleDateString()
        : '-',
      action: row.action || {
        consignmentId: row.consignmentId,
        assetId: row.assetId,
      },
    }));
  }, [inTransitData]);

  const inTransitPagination = React.useMemo(() => {
    return inTransitData?.data?.pagination || inTransitData?.pagination;
  }, [inTransitData]);

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
        ticketId: selectedAllocationRecord?.ticket?.id || formData.allocationDetails?.ticket?.id || null,
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
        estimatedDeliveryDate: formData.estimatedDeliveryDate,
      };

      
      // Make API call to update consignment status to dispatched
      await patchMutation({
        endpoint:
          config.endpoints.consignments?.dispatch?.(currentConsignment.id) ||
          `/consignments/${currentConsignment.id}/dispatch`,
        body: payload,
      });
      
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

  const storedLocationOptions = React.useMemo(() => {
    const source = Array.isArray(campusLocationsData)
      ? campusLocationsData
      : Array.isArray(campusLocationsData?.data)
      ? campusLocationsData.data
      : [];

    return source
      .map((location) => ({
        value: location?.id,
        label: location?.name || location?.locationName || '',
      }))
      .filter((option) => option.value && option.label);
  }, [campusLocationsData]);

  useEffect(() => {
    if (isAcceptModalOpen && !acceptReturnCampusId) {
      toast.error('Campus ID not found for this return item');
    }
  }, [isAcceptModalOpen, acceptReturnCampusId]);

  useEffect(() => {
    if (isAcceptModalOpen && isCampusLocationsError) {
      toast.error('Failed to fetch storage locations');
    }
  }, [isAcceptModalOpen, isCampusLocationsError]);

  // Accept return form fields (built dynamically with locations fetched via useFetch)
  const acceptReturnFields = React.useMemo(
    () => getAcceptReturnFields(storedLocationOptions),
    [storedLocationOptions]
  );

  const getReturnActionIdentifiers = React.useCallback((item) => {
    const consignmentId = item?.consignmentId;
    const assetId =
      item?.action?.assetId ||
      item?.assetId ||
      item?.asset?.id;

    if (!consignmentId) {
      throw new Error('Consignment ID is missing for this return item');
    }

    if (!assetId) {
      throw new Error('Asset ID is missing for this return item');
    }

    return { consignmentId, assetId };
  }, []);

  // Handle accept return form submit
  const handleAcceptSubmit = async (formData) => {
    setIsAcceptSubmitting(true);
    const loadingToastId = toast.loading('Processing acceptance...');
    try {
      const { consignmentId, assetId } = getReturnActionIdentifiers(currentInTransitItem);

      if (!formData?.storedIn) {
        throw new Error('Please select a storage location');
      }

      const payload = {
        status: 'ACCEPTED',
        storedLocationId: formData.storedIn,
        notes: formData.comment || '',
      };

      await patchMutation({
        endpoint:
          config.endpoints.consignmentReturnAssets?.assetById?.(consignmentId, assetId) ||
          `/consignment/assets/return/${consignmentId}/${assetId}`,
        body: payload,
      });

      toast.dismiss(loadingToastId);
      toast.success(`Return accepted for ${currentInTransitItem?.assetTag}`);

      await refetchInTransit();

      setIsAcceptModalOpen(false);
      setCurrentInTransitItem(null);
    } catch (error) {
      console.error('Error accepting return:', error);
      toast.dismiss(loadingToastId);
      toast.error(error?.message || 'Failed to accept return');
    } finally {
      setIsAcceptSubmitting(false);
    }
  };

  // In-transit action handlers
  const handleInTransitAction = React.useCallback(async (action, item) => {
    setOpenInTransitMenuId(null);

    if (action === 'Accepted') {
      setCurrentInTransitItem(item);
      setIsAcceptModalOpen(true);
      return;
    }

    if (action === 'Rejected') {
      const loadingToastId = toast.loading('Processing rejection...');
      try {
        const { consignmentId, assetId } = getReturnActionIdentifiers(item);

        const payload = {
          status: 'REJECTED',
          notes: 'Rejected from in-transit returns',
        };

        await patchMutation({
          endpoint:
            config.endpoints.consignmentReturnAssets?.assetById?.(consignmentId, assetId) ||
            `/consignment/assets/return/${consignmentId}/${assetId}`,
          body: payload,
        });

        toast.dismiss(loadingToastId);
        toast.success(`Return rejected for ${item.assetTag}`);
        await refetchInTransit();
      } catch (error) {
        console.error('Error rejecting return:', error);
        toast.dismiss(loadingToastId);
        toast.error(error?.message || 'Failed to reject return');
      }
      return;
    }

    toast.success(`Marked as ${action}: ${item.assetTag}`);
  }, [getReturnActionIdentifiers, patchMutation, refetchInTransit]);

  // Render cell for in-transit table (with actions column)
  const renderInTransitCellWithActions = (item, columnKey) => {
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

      return <ActionMenu menuOptions={menuOptions} />;
    }
    return renderInTransitCell(item, columnKey);
  };

  // Show loading only on initial load
  const showLoading = isLoading && !data;

  // Error state
  const showErrorBanner = isError && !data;
  
  // Render cell content with custom formatting
  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    if (columnKey === 'consignmentCode') {
      return (
        <span className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
          {cellValue}
        </span>
      );
    }
        
    if (columnKey === 'assetCount') {
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
    }
        
    if (columnKey === 'actions') {
      const normalizedItemStatus = item.status?.toLowerCase().replace(/\s+/g, '_');
      const trackingUrl = String(item.trackingLink || '').trim();
      const canTrack =
        normalizedItemStatus === 'dispatched' &&
        item.trackingId &&
        item.trackingId !== '-' &&
        trackingUrl;
      
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
                window.open(trackingUrl, '_blank', 'noopener,noreferrer');
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
    }

    const columnDef = consignmentTableColumns.find(col => col.key === columnKey); 
    return <GenericCellRenderer item={item} column={columnDef || { key: columnKey }} />;
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

      <div className="mt-6">
      <TableWrapper
        key={showInTransit ? 'transit' : 'consignments'}
        data={showInTransit ? inTransitTableData : tableData}
        columns={showInTransit ? inTransitColumns : visibleColumns}
        title={showInTransit ? 'In-Transit Returns' : 'Consignments'}
        renderCell={showInTransit ? renderInTransitCellWithActions : renderCell}
        onRowClick={showInTransit ? undefined : handleRowClick}
        itemsPerPage={showInTransit ? inTransitPageSize : pageSize}
        showPagination={true}
        ariaLabel={showInTransit ? 'In-transit returns table' : 'Consignments table'}
        showCreateButton={false}
        onCreateClick={handleCreateClick}
        isLoading={showInTransit ? isInTransitLoading : showLoading}
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
        serverPagination={true}
        paginationData={showInTransit ? inTransitPagination : data?.pagination}
        onPageChange={showInTransit ? setInTransitPage : handlePageChange}
        onPageSizeChange={showInTransit ? (size) => { setInTransitPageSize(size); setInTransitPage(1); } : handlePageSizeChange}
      />
      </div>
      
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
