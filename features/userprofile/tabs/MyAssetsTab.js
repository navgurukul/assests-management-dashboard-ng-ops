'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Package, Laptop, CheckCircle2, XCircle, Download, ArrowRightLeft, ChevronRight, ChevronDown } from 'lucide-react';
import ActionMenu from '@/components/molecules/ActionMenu';
import FormModal from '@/components/molecules/FormModal';
import Modal from '@/components/molecules/Modal';
import CustomButton from '@/components/atoms/CustomButton';
import StatusChip from '@/components/atoms/StatusChip';
import { getConditionChipColor } from '@/app/utils/statusHelpers';
import { useQueryClient } from '@tanstack/react-query';
import useFetch from '@/app/hooks/query/useFetch';
import usePost from '@/app/hooks/query/usePost';
import usePatch from '@/app/hooks/query/usePatch';
import config from '@/app/config/env.config';
import { toast } from '@/app/utils/toast';
import { downloadNOC } from '../utils/downloadNOC';
import { getAssetMenuOptions } from '@/dummyJson/dummyJson';
import {
  getReturnAssetFields,
  returnAssetValidationSchema,
} from '@/app/config/formConfigs/returnAssetModalConfig';
import {
  getExtendLeaseFields,
  getExtendLeaseValidationSchema,
} from '@/app/config/formConfigs/extendLeaseModalConfig';
import {
  assetReceivedFields,
  assetReceivedValidationSchema,
} from '@/app/config/formConfigs/assetReceivedModalConfig';

export default function MyAssetsTab({ userData = {} }) {
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [receivedModalOpen, setReceivedModalOpen] = useState(false);
  const [nocModalOpen, setNocModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [expandedTimelines, setExpandedTimelines] = useState({});
  const [selectedAllocationId, setSelectedAllocationId] = useState(null);
  const [coordinatorCampusId, setCoordinatorCampusId] = useState(null);

  const queryClient = useQueryClient();

  const formStateRef = useRef({});
  const hasToastedRef = useRef(null);
  const [coordinatorUpdateTick, setCoordinatorUpdateTick] = useState(0);
  const [localFormState, setLocalFormState] = useState({});
  
  useEffect(() => {
    setLocalFormState(formStateRef.current);
  }, [coordinatorUpdateTick]);

  const { mutateAsync: postMutation, isPending: isPostPending } = usePost();
  const { mutateAsync: patchMutation, isPending: isPatchPending } = usePatch();

  const { 
    data: userAssets = [], 
    isLoading: isLoadingAssets, 
    error: assetsError 
  } = useFetch({
    url: config.endpoints.allocations.myAssets,
    queryKey: ['myAssets']
  });

  const { data: campusesResponse } = useFetch({
    url: '/campuses',
    queryKey: ['campuses'],
    enabled: returnModalOpen,
  });

  const { data: coordinatorResponse, error: coordinatorError, failureCount } = useFetch({
    url: `/campus-incharge/campus/${coordinatorCampusId}`,
    queryKey: ['campus-incharge', coordinatorCampusId],
    enabled: !!coordinatorCampusId,
  });

  const campusesData = useMemo(() => {
    return campusesResponse?.data?.data || campusesResponse?.data || campusesResponse || [];
  }, [campusesResponse]);

  const coordinatorEmail = useMemo(() => {
    if (!coordinatorResponse) return '';
    const data = coordinatorResponse?.data || coordinatorResponse;
    if (data?.success === false) return '';
    return data?.data?.itCoordinator?.email || data?.itCoordinator?.email || '';
  }, [coordinatorResponse]);

  // Extract variables locally so they are guaranteed to exist identically on every render sequence
  const coordinatorData = coordinatorResponse?.data || coordinatorResponse;
  const isCoordinatorError = coordinatorError || coordinatorData?.success === false || failureCount > 0;

  useEffect(() => { 
    if (!coordinatorCampusId) {
      hasToastedRef.current = null;
      return;
    }

    if (isCoordinatorError) {
      if (hasToastedRef.current !== coordinatorCampusId) {
        toast.error('This campus is not having an IT coordinator at present.');
        formStateRef.current.campusItCoordinator = '';
        setTimeout(() => setCoordinatorUpdateTick(t => t + 1), 0);
        hasToastedRef.current = coordinatorCampusId;
      }
    } else if (coordinatorEmail) {
      if (hasToastedRef.current !== coordinatorCampusId) {
        formStateRef.current.campusItCoordinator = coordinatorEmail;
        setTimeout(() => setCoordinatorUpdateTick(t => t + 1), 0);
        hasToastedRef.current = coordinatorCampusId;
      }
    }
  }, [coordinatorEmail, isCoordinatorError, coordinatorCampusId]);

  // Extract assets, allocations and assetMovements early so handlers can access them
  const assets = userAssets?.data?.assets || userAssets?.assets || [];
  const allocations = userAssets?.data?.allocations || userAssets?.allocations || [];
  const assetMovements = userAssets?.data?.assetMovements || userAssets?.assetMovements || [];

  const allocationMap = (() => {
    const map = {};
    allocations.forEach((allocation) => {
      allocation.assetIds?.forEach((assetId) => {
        map[assetId] = {
          id: allocation.id,
          createdAt: allocation.createdAt,
          allocationType: allocation.allocationType,
          allocationReason: allocation.allocationReason,
          allocationCode: allocation.allocationCode,
          sourceName: allocation.sourceName,
          destinationName: allocation.destinationName,
          userAddress: allocation.userAddress,
        };
      });
    });
    return map;
  })();

  const computedReturnFields = (() => {
    const fields = getReturnAssetFields(
      selectedAsset, 
      allocationMap[selectedAsset?.id]?.sourceName,
      allocationMap[selectedAsset?.id]?.userAddress
    );

    return (fields || []).map((f) => {
      const newField = { ...f };

      // Keep the campus picker local to this screen so returnMode never becomes a query param.
      if (newField.name === 'destinationCampusId') {
        newField.dependsOn = null;
        newField.staticItems = campusesData;
      }

      // Preserve whatever the user actually typed previously, and apply new coordinator values
      if (localFormState[newField.name] !== undefined) {
        newField.defaultValue = localFormState[newField.name];
      }

      return newField;
    });
  })();

  const handleExtendLease = (asset) => {
    setSelectedAsset(asset);
    setSelectedAllocationId(allocationMap[asset.id]?.id || null);
    setExtendModalOpen(true);
  };

  const handleReturnAsset = (asset) => {
    setSelectedAsset(asset);
    setReturnModalOpen(true);
  };

  const handleAssetReceived = (asset) => {
    if (asset.consignmentStatus === 'DELIVERED') {
      toast.error('Asset has already been delivered.');
      return;
    }
    setSelectedAsset(asset);
    setReceivedModalOpen(true);
  };

  const handleAssetReceivedSubmit = async (formData) => {
    try {
      const consignmentId = selectedAsset?.consignmentId || selectedAsset?.consignment?.id;

      if (!consignmentId) {
        toast.error('Consignment ID not found for this asset.');
        return;
      }

      await patchMutation({
        endpoint:
          config.endpoints.consignments?.deliver?.(consignmentId) ||
          `/consignments/${consignmentId}/deliver`,
        body: {
          asset_id: selectedAsset?.id,
          deviceConditionOnReceive: formData.deviceConditionOnReceive,
          receiveNotes: formData.receiveNotes || undefined,
          issueType:
            formData.deviceConditionOnReceive !== 'WORKING' ? formData.issueType : undefined,
          havingIssue: formData.deviceConditionOnReceive !== 'WORKING',
        },
      });
      toast.success('Asset received confirmation submitted successfully.');
      setReceivedModalOpen(false);
      setSelectedAsset(null);
      queryClient.invalidateQueries({ queryKey: ['myAssets'] });
      // queryClient.invalidateQueries({ queryKey: ['userMe'] });
    } catch (err) {
      toast.error(err?.message || 'Failed to confirm asset received.');
    }
  };

  const handleReturnSubmit = async (formData) => {
    try {
      const consignmentId = selectedAsset?.consignmentId || selectedAsset?.consignment?.id;
      
      const expDate = formData.expectedDeliveryDate;
      const formattedDate = expDate instanceof Date
        ? expDate.toISOString().split('T')[0]
        : (typeof expDate === 'string' ? expDate : '');

      let sourceCampusIdValue = '';
      let returnTypeValue = '';

      if (formData.returnMode === 'VISIT_CAMPUS') {
        sourceCampusIdValue = formData.destinationCampusId || formData.sourceCampusId;
        returnTypeValue = 'RETURN_PHYSICALLY';
      } else if (formData.returnMode === 'OTHER_CAMPUS') {
        sourceCampusIdValue = formData.destinationCampusId || formData.sourceCampusId;
        returnTypeValue = 'RETURN_TO_OTHER_CAMPUS';
      } else if (formData.returnMode === 'SOURCED_CAMPUS') {
        sourceCampusIdValue = selectedAsset?.sourceCampusId || selectedAsset?.campusId;
        returnTypeValue = 'RETURN_TO_SOURCE_CAMPUS';
      }

      const fields = {
        ...(consignmentId ? { consignmentId } : {}),
        assetId: selectedAsset?.id,
        returnType: returnTypeValue,
        sourceCampusId: sourceCampusIdValue,
        campusITCoordinatorEmail: formData.campusItCoordinator || coordinatorEmail || '',
        exactAddress: formData.exactAddress || '',
        vendorName: formData.returnMode === 'VISIT_CAMPUS' ? 'NA' : (formData.vendorName || ''),
        managerEmail: formData.managerEmail || '',
        expectedDeliveryDate: formattedDate,
      };

      // Add trackingId only for SOURCED_CAMPUS and OTHER_CAMPUS (not for VISIT_CAMPUS)
      if (formData.returnMode !== 'VISIT_CAMPUS') {
        fields.trackingId = formData.trackingId || '';
      }

      const payload = new FormData();
      Object.entries(fields).forEach(([key, value]) => payload.append(key, value));
      
      const vendorReceipts = Array.from(formData.vendorReceipt || []);
      if (vendorReceipts.length > 0) {
        vendorReceipts.forEach((file) => payload.append('vendorReceipt', file));
      } else if (formData.returnMode === 'VISIT_CAMPUS') {
        payload.append('vendorReceipt', new File(['dummy'], 'NA.pdf', { type: 'application/pdf' }));
      }

      await postMutation({
        endpoint: '/consignment/assets/return',
        body: payload,
      });

      toast.success('Return asset request created successfully.');
      queryClient.invalidateQueries({ queryKey: ['myAssets'] });
      setReturnModalOpen(false);
      setSelectedAsset(null);
      formStateRef.current = {};
    } catch (err) {
      toast.error(err?.message || 'Failed to submit return asset request.');
    }
  };

  const handleExtendSubmit = async (formData) => {
    if (!selectedAllocationId) {
      toast.error('Could not determine allocation for this asset.');
      return;
    }

    try {
      await postMutation({
        endpoint: `/allocations/${selectedAllocationId}/lease-extensions`,
        body: {
          leaseType: formData.leaseType,
          extendUntil: formData.extendUntil,
          description: formData.description || undefined,
        },
      });

      toast.success('Lease extension request submitted successfully.');
      setExtendModalOpen(false);
      setSelectedAsset(null);
      setSelectedAllocationId(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to submit lease extension request.');
    }
  };

  const handleReturnFormChange = (updatedData, fieldChanged) => {
    let nextData = updatedData;
    
    if (fieldChanged) {
      const { name } = fieldChanged;
      const { returnMode, destinationCampusId } = updatedData;
      const isOtherOrVisit = returnMode === 'OTHER_CAMPUS' || returnMode === 'VISIT_CAMPUS';

      switch (name) {
        case 'returnMode':
          if (isOtherOrVisit) {
            setTimeout(() => setCoordinatorCampusId(null), 0);
            nextData = {
              ...updatedData,
              exactAddress: '',
              destinationCampusId: '',
              campusItCoordinator: '',
              managerEmail: '',
              expectedDeliveryDate: '',
              vendorName: '',
              vendorReceipt: null,
            };
          } else if (returnMode === 'SOURCED_CAMPUS') {
            const assetAddress = selectedAsset?.campus?.address || allocationMap[selectedAsset?.id]?.userAddress || '';
            const sourceId = selectedAsset?.sourceCampusId || selectedAsset?.campusId;
            
            if (sourceId) {
              setTimeout(() => setCoordinatorCampusId(sourceId), 0);
            }
            nextData = {
              ...updatedData,
              exactAddress: assetAddress,
              destinationCampusId: '',
              managerEmail: '',
              expectedDeliveryDate: '',
              vendorName: '',
              vendorReceipt: null,
            };
          }
          break;

        case 'destinationCampusId':
          if (isOtherOrVisit) {
            if (destinationCampusId) {
              setTimeout(() => setCoordinatorCampusId(destinationCampusId), 0);
              const selectedCampus = campusesData.find((c) => c.id === destinationCampusId);
              if (selectedCampus?.address) {
                nextData = { ...updatedData, exactAddress: selectedCampus.address };
              }
            } else {
              setTimeout(() => setCoordinatorCampusId(null), 0);
              nextData = {
                ...updatedData,
                exactAddress: '',
                campusItCoordinator: '',
              };
            }
          }
          break;

        default:
          break;
      }
    }

    formStateRef.current = nextData;
    return nextData;
  };

  // allocationMap and assets are computed via useMemo above

  if (isLoadingAssets) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-sm text-gray-500">Loading assets...</p>
      </div>
    );
  }

  if (assetsError) {
    return (
      <div className="text-center py-12">
        <XCircle className="mx-auto h-12 w-12 text-red-400" />
        <p className="mt-2 text-sm text-red-500">{assetsError?.message || 'Failed to load assets'}</p>
      </div>
    );
  }

  const allAssetsAccepted =
    assets.length > 0 && assets.every((asset) => asset.consignmentReturnStatus === 'ACCEPTED');

  const movementStyleConfig = {
    ALLOCATION: { label: 'Allocation', textColor: 'text-(--theme-main)', bg: '' },
    'RETURN ACCEPTED': { label: 'Return Accepted', textColor: 'text-green-700', bg: 'bg-green-50' },
    RETURN_REQUESTED: { label: 'Return Requested', textColor: 'text-amber-700', bg: 'bg-amber-50' },
  };

  // Build cards for returned assets that only exist in movements (not in assets array)
  const activeAssetTags = new Set(assets.map((assetItem) => assetItem.assetTag));
  const returnedAssetMap = {};
  assetMovements.forEach((movement) => {
    const tag = movement.newAssetTag || movement.assetTag;
    if (!tag || activeAssetTags.has(tag)) return;
    if (!returnedAssetMap[tag]) {
      returnedAssetMap[tag] = { assetTag: tag, movements: [] };
    }
    returnedAssetMap[tag].movements.push(movement);
    // Also capture the previous tag movements under the same group
    if (movement.previousAssetTag && movement.previousAssetTag !== tag && !activeAssetTags.has(movement.previousAssetTag)) {
      if (!returnedAssetMap[movement.previousAssetTag]) {
        returnedAssetMap[movement.previousAssetTag] = { assetTag: movement.previousAssetTag, movements: [] };
      }
      returnedAssetMap[movement.previousAssetTag].movements.push(movement);
    }
  });
  const returnedAssets = Object.values(returnedAssetMap);

  // Check if every device's latest movement is "RETURN ACCEPTED"
  const allDevicesReturned = (() => {
    if (assetMovements.length === 0) return false;
    const latestByTag = {};
    assetMovements.forEach((movement) => {
      const tag = movement.newAssetTag || movement.assetTag;
      if (!tag) return;
      const movedAt = new Date(movement.movedAt).getTime();
      if (!latestByTag[tag] || movedAt > latestByTag[tag].time) {
        latestByTag[tag] = { time: movedAt, type: movement.movementType };
      }
    });
    const latestEntries = Object.values(latestByTag);
    return latestEntries.length > 0 && latestEntries.every((entry) => entry.type === 'RETURN ACCEPTED');
  })();

  const canDownloadNOC = (assets.length === 0 && assetMovements.length > 0) || allDevicesReturned;

  const formatMovementDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    return new Date(isoDate).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const assetMenuHandlers = { handleAssetReceived, handleReturnAsset, handleExtendLease };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">My Assets</h1>
        <CustomButton
          text="Download NOC"
          onClick={() => setNocModalOpen(true)}
          variant="primary"
          size="sm"
          disabled={!canDownloadNOC}
          icon={Download}
        />
      </div>
      
      {(assets.length > 0 || returnedAssets.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Active asset cards */}
          {assets.map((asset) => {
            const allocation = allocationMap[asset.id];
            const allocatedDate = allocation?.createdAt 
              ? new Date(allocation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : 'N/A';

            return (
              <div
                key={asset.id}
                className="bg-(--surface) border border-(--border) rounded-lg p-4 shadow-sm flex flex-col"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg  flex items-center justify-center shrink-0">
                      <Laptop className="w-4 h-4 text-(--theme-main)" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground leading-tight">{asset.assetTag}</h3>
                      <p className="text-xs text-(--muted)">
                        {asset.brand ? `${asset.brand} ${asset.model} · ` : ''}{asset.campus?.campusName || 'N/A'} Campus
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 tracking-wide">
                      {asset.status}
                    </span>
                    {asset.consignmentReturnStatus === 'ACCEPTED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 cursor-default select-none">
                        <CheckCircle2 className="w-3 h-3" />
                        Returned & accepted
                     </span>
                    ) : asset.consignmentReturnStatus === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-default select-none">
                        <ArrowRightLeft className="w-3 h-3" />
                        Return In Progress
                      </span>
                      ) : !asset.consignmentId ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 cursor-default select-none">
                        Device Allocated
                      </span>
                      ) : asset.consignmentStatus === 'DRAFT' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-200 cursor-default select-none">
                        Dispatch Pending
                      </span>
                    ) : (
                      <ActionMenu menuOptions={getAssetMenuOptions(asset, assetMenuHandlers)} />
                    )}
                  </div>
                </div>

                {/* Info Grid — uniform boxes */}
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  <div className=" rounded-lg px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-(--muted) mb-0.5">Serial No.</p>
                    <p className="text-xs font-medium text-foreground truncate" title={asset.serialNumber}>{asset.serialNumber || 'N/A'}</p>
                  </div>
                  <div className=" rounded-lg px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-(--muted) mb-0.5">Condition</p>
                    <p className="text-xs font-medium text-foreground">{asset.condition || 'N/A'}</p>
                  </div>
                  <div className=" rounded-lg px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-(--muted) mb-0.5">Storage</p>
                    <p className="text-xs font-medium text-foreground">{asset.storageSizeGB ? `${asset.storageSizeGB} GB` : 'N/A'}</p>
                  </div>
                  <div className=" rounded-lg px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-(--muted) mb-0.5">Source</p>
                    <p className="text-xs font-medium text-foreground">{asset.sourceType ? asset.sourceType.charAt(0) + asset.sourceType.slice(1).toLowerCase() : 'N/A'}</p>
                  </div>
                  <div className=" rounded-lg px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-(--muted) mb-0.5">Allocated</p>
                    <p className="text-xs font-medium text-foreground">{allocatedDate}</p>
                  </div>
                  <div className=" rounded-lg px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-(--muted) mb-0.5">Accessories</p>
                    <div className="flex items-center gap-1.5">
                      {asset.charger && (
                        <span className="flex items-center gap-0.5 text-[11px] text-green-700">
                          <CheckCircle2 className="w-3 h-3" /> Charger
                        </span>
                      )}
                      {asset.bag && (
                        <span className="flex items-center gap-0.5 text-[11px] text-green-700">
                          <CheckCircle2 className="w-3 h-3" /> Bag
                        </span>
                      )}
                      {!asset.charger && !asset.bag && (
                        <span className="text-[11px] text-gray-400">None</span>
                      )}
                    </div>
                  </div>
                  {allocation && (
                    <>
                      <div className=" rounded-lg px-2.5 py-2 col-span-2">
                        <p className="text-[9px] uppercase tracking-wider text-(--muted) mb-0.5">Allocation Code</p>
                        <p className="text-xs font-medium text-foreground font-mono truncate" title={allocation.allocationCode}>{allocation.allocationCode || 'N/A'}</p>
                      </div> 
                    </>
                  )}
                  {asset.ownedBy && (
                    <div className=" rounded-lg px-2.5 py-2">
                      <p className="text-[9px] uppercase tracking-wider text-(--muted) mb-0.5">Owned By</p>
                      <p className="text-xs font-medium text-foreground">{asset.ownedBy.toUpperCase()}</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {asset.notes && (
                  <div className="mt-2  rounded-lg px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-(--muted) mb-0.5">Notes</p>
                    <p className="text-xs text-(--muted) line-clamp-2" title={asset.notes}>{asset.notes}</p>
                  </div>
                )}

                {/* Per-Asset Movement Timeline */}
                <div className="mt-auto">
                {(() => {
                  const assetMovementsFiltered = assetMovements.filter((movement) => {
                    const movementTag = movement.newAssetTag || movement.assetTag;
                    const previousTag = movement.previousAssetTag;
                    return (
                      movement.assetId === asset.id ||
                      movementTag === asset.assetTag ||
                      previousTag === asset.assetTag
                    );
                  });

                  if (assetMovementsFiltered.length === 0) return null;

                  const isTimelineExpanded = !!expandedTimelines[asset.id];

                  return (
                    <div className="mt-2 pt-2 border-t border-(--border)">
                      <button
                        type="button"
                        onClick={() => setExpandedTimelines((prev) => ({ ...prev, [asset.id]: !prev[asset.id] }))}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-(--muted) uppercase tracking-widest mb-2 hover:text-foreground transition-colors cursor-pointer"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTimelineExpanded ? '' : '-rotate-90'}`} />
                        Movement History ({assetMovementsFiltered.length})
                      </button>
                      {isTimelineExpanded && (
                      <div className="flex items-stretch gap-0 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                        {assetMovementsFiltered.map((movement, movementIndex) => {
                          const movementStyle = movementStyleConfig[movement.movementType] || movementStyleConfig.ALLOCATION;
                          const formattedReason = movement.allocationReason
                            ? movement.allocationReason.charAt(0) + movement.allocationReason.slice(1).toLowerCase()
                            : null;

                          return (
                            <div key={movement.id} className="flex items-stretch gap-0 shrink-0">
                              <div
                                className="relative w-40 h-full bg-(--surface) border border-(--border) rounded-lg px-2.5 py-1.5 cursor-default hover:shadow-md transition-shadow"
                              >
                                <span className={`text-[10px] font-semibold uppercase tracking-wide ${movementStyle.textColor}`}>
                                  {movementStyle.label}
                                </span> 
                                {!formattedReason && movement.notes && (
                                  <p className="text-[11px] text-(--muted) mt-0.5 truncate max-w-[132px]">{movement.notes}</p>
                                )}
                                <p className="text-[11px] text-(--theme-light) mt-0.5">{formatMovementDate(movement.movedAt)}</p>
                              </div>
                              {movementIndex < assetMovementsFiltered.length - 1 && (
                                <div className="text-(--border) shrink-0 flex items-center px-0.5">
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      )}
                    </div>
                  );
                })()}
                </div>
              </div>
            );
          })}
          {/* Returned asset cards (only in movements, not in active assets) */}
          {returnedAssets.map((returnedAsset) => {
            const sortedMovements = [...returnedAsset.movements].sort(
              (first, second) => new Date(second.movedAt) - new Date(first.movedAt)
            );
            const latestMovement = sortedMovements[0];
            const latestType = latestMovement?.movementType || '';
            const isAccepted = latestType === 'RETURN ACCEPTED';

            return (
              <div
                key={returnedAsset.assetTag}
                className="bg-(--surface) border border-(--border) rounded-lg p-4 shadow-sm opacity-80 flex flex-col"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Laptop className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground leading-tight">{returnedAsset.assetTag}</h3>
                      <p className="text-xs text-(--muted)">Previously assigned asset</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isAccepted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Returned & Accepted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <ArrowRightLeft className="w-3 h-3" />
                        Return In Progress
                      </span>
                    )}
                  </div>
                </div>

                {/* Returned message */}
                <div className={`rounded-lg px-3 py-2 mb-3 ${isAccepted ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
                  <p className={`text-xs ${isAccepted ? 'text-green-700' : 'text-amber-700'}`}>
                    {isAccepted
                      ? 'This asset has been returned and accepted by the campus. No further action is needed.'
                      : 'A return request has been raised for this asset. It is currently being processed.'}
                  </p>
                </div>

                {/* Movement Timeline */}
                <div className="mt-auto">
                {sortedMovements.length > 0 && (() => {
                  const isTimelineExpanded = !!expandedTimelines[returnedAsset.assetTag];

                  return (
                  <div className="pt-2 border-t border-(--border)">
                    <button
                      type="button"
                      onClick={() => setExpandedTimelines((prev) => ({ ...prev, [returnedAsset.assetTag]: !prev[returnedAsset.assetTag] }))}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-(--muted) uppercase tracking-widest mb-2 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTimelineExpanded ? '' : '-rotate-90'}`} />
                      Movement History ({sortedMovements.length})
                    </button>
                    {isTimelineExpanded && (
                    <div className="flex items-stretch gap-0 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                      {sortedMovements.map((movement, movementIndex) => {
                        const movementStyle = movementStyleConfig[movement.movementType] || movementStyleConfig.ALLOCATION;
                        const formattedReason = movement.allocationReason
                          ? movement.allocationReason.charAt(0) + movement.allocationReason.slice(1).toLowerCase()
                          : null;

                        return (
                          <div key={movement.id} className="flex items-stretch gap-0 shrink-0">
                            <div
                              className="relative w-40 h-full bg-(--surface) border border-(--border) rounded-lg px-2.5 py-1.5 cursor-default hover:shadow-md transition-shadow"
                            >
                              <span className={`text-[10px] font-semibold uppercase tracking-wide ${movementStyle.textColor}`}>
                                {movementStyle.label}
                              </span>
                              {!formattedReason && movement.notes && (
                                <p className="text-[11px] text-(--muted) mt-0.5 truncate max-w-[132px]">{movement.notes}</p>
                              )}
                              <p className="text-[11px] text-(--theme-light) mt-0.5">{formatMovementDate(movement.movedAt)}</p>
                            </div>
                            {movementIndex < sortedMovements.length - 1 && (
                              <div className="text-(--border) shrink-0 flex items-center px-0.5">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    )}
                  </div>
                  );
                })()}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 mt-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Package className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No assets assigned</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            You currently do not have any assets assigned to you. When assets are allocated, they will automatically appear here.
          </p>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Please raise a new ticket for asset allocation.
          </p>
        </div>
      )}

      <FormModal
        isOpen={receivedModalOpen}
        onClose={() => { setReceivedModalOpen(false); setSelectedAsset(null); }}
        componentName=""
        actionType="Asset Received"
        fields={assetReceivedFields}
        onSubmit={handleAssetReceivedSubmit}
        isSubmitting={isPatchPending}
        size="medium"
        validationSchema={assetReceivedValidationSchema}
      />

      <FormModal
        isOpen={extendModalOpen}
        onClose={() => { setExtendModalOpen(false); setSelectedAsset(null); setSelectedAllocationId(null); }}
        componentName=""
        actionType="Extend Lease"
        fields={getExtendLeaseFields()}
        onSubmit={handleExtendSubmit}
        isSubmitting={isPostPending}
        size="medium"
        validationSchema={getExtendLeaseValidationSchema()}
      />

      <FormModal
        isOpen={returnModalOpen}
        onClose={() => { setReturnModalOpen(false); setSelectedAsset(null); setCoordinatorCampusId(null); formStateRef.current = {}; }}
        componentName=""
        actionType="Return Asset"
        fields={computedReturnFields}
        onSubmit={handleReturnSubmit}
        isSubmitting={isPostPending}
        size="medium"
        validationSchema={returnAssetValidationSchema}
        onFormDataChange={handleReturnFormChange}
      />

      {/* NOC Modal */}
      <Modal
        isOpen={nocModalOpen}
        onClose={() => setNocModalOpen(false)}
        title="No Objection Certificate (NOC)"
        size="medium"
      >
        <div className="flex flex-col items-center text-center gap-5 py-4">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">NOC Granted</h2>
            <p className="text-sm text-gray-500">
              All your devices have been successfully submitted and accepted by the campus.
            </p>
          </div>
          <CustomButton
            text="Download NOC"
            onClick={() => downloadNOC(userData, assetMovements)}
            variant="success"
            size="md"
            icon={Download}
          />
        </div>
      </Modal>
    </div>
  );
}