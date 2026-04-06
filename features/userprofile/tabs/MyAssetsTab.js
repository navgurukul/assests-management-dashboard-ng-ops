'use client';

import { useState, useMemo, useEffect } from 'react';
import { Package, Laptop, HardDrive, Cpu, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import FormModal from '@/components/molecules/FormModal';
import CustomButton from '@/components/atoms/CustomButton';
import StatusChip from '@/components/atoms/StatusChip';
import { getConditionChipColor } from '@/app/utils/statusHelpers';
import useFetch from '@/app/hooks/query/useFetch';
import usePost from '@/app/hooks/query/usePost';
import usePatch from '@/app/hooks/query/usePatch';
import config from '@/app/config/env.config';
import { toast } from '@/app/utils/toast';
import {
  getReturnAssetFields,
  returnAssetValidationSchema,
} from '@/app/config/formConfigs/returnAssetModalConfig';
import {
  extendLeaseFields,
  extendLeaseValidationSchema,
} from '@/app/config/formConfigs/extendLeaseModalConfig';
import {
  assetReceivedFields,
  assetReceivedValidationSchema,
} from '@/app/config/formConfigs/assetReceivedModalConfig';

export default function MyAssetsTab() {
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [receivedModalOpen, setReceivedModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAllocationId, setSelectedAllocationId] = useState(null);
  const [coordinatorCampusId, setCoordinatorCampusId] = useState(null);

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

  const { data: campusesResponse, refetch: fetchCampuses } = useFetch({
    url: '/campuses',
    queryKey: ['campuses'],
    enabled: false,
  });

  const { data: coordinatorResponse, error: coordinatorError } = useFetch({
    url: `/campus-incharge/campus/${coordinatorCampusId}`,
    queryKey: ['campus-incharge', coordinatorCampusId],
    enabled: !!coordinatorCampusId,
  });

  const campusesData = campusesResponse?.data?.data || campusesResponse?.data || campusesResponse || [];

  const coordinatorEmail = useMemo(() => {
    if (!coordinatorResponse) return '';
    const data = coordinatorResponse?.data || coordinatorResponse;
    if (data?.success === false) return '';
    return data?.data?.itCoordinator?.email || data?.itCoordinator?.email || '';
  }, [coordinatorResponse]);

  useEffect(() => {
    if (!coordinatorCampusId) return;

    const data = coordinatorResponse?.data || coordinatorResponse;
    const isErrorState = coordinatorError || data?.success === false;

    const input = document.querySelector('input[name="campusItCoordinator"]');
    if (!input) return;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

    if (isErrorState) {
      toast.error('This campus is not having an IT coordinator at present.');
      nativeInputValueSetter.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (coordinatorEmail) {
      nativeInputValueSetter.call(input, coordinatorEmail);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, [coordinatorEmail, coordinatorError, coordinatorResponse, coordinatorCampusId]);

  // Extract assets and build allocationMap early so handlers can access it
  const assets = userAssets?.data?.assets || userAssets?.assets || [];
  const allocations = userAssets?.data?.allocations || userAssets?.allocations || [];

  const allocationMap = useMemo(() => {
    const map = {};
    allocations.forEach((allocation) => {
      allocation.assetIds?.forEach((assetId) => {
        map[assetId] = {
          id: allocation.id,
          createdAt: allocation.createdAt,
          allocationType: allocation.allocationType,
          allocationReason: allocation.allocationReason,
          sourceName: allocation.sourceName,
          destinationName: allocation.destinationName,
          userAddress: allocation.userAddress,
        };
      });
    });
    return map;
  }, [allocations]);

  const computedReturnFields = useMemo(() => {
    return getReturnAssetFields(
      selectedAsset, 
      allocationMap[selectedAsset?.id]?.sourceName,
      allocationMap[selectedAsset?.id]?.userAddress
    );
  }, [selectedAsset, allocationMap]);

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
      if (formData.returnMode === 'VISIT_CAMPUS' || formData.returnMode === 'OTHER_CAMPUS') {
        sourceCampusIdValue = formData.destinationCampusId || formData.sourceCampusId;
      } else if (formData.returnMode === 'SOURCED_CAMPUS') {
        sourceCampusIdValue = selectedAsset?.sourceCampusId || selectedAsset?.campusId;
      }

      const fields = {
        consignmentId,
        assetId: selectedAsset?.id,
        sourceCampusId: sourceCampusIdValue,
        campusITCoordinatorEmail: formData.campusItCoordinator || coordinatorEmail || '',
        exactAddress: formData.exactAddress || '',
        vendorName: formData.returnMode === 'VISIT_CAMPUS' ? 'NA' : (formData.vendorName || ''),
        managerEmail: formData.managerEmail || '',
        expectedDeliveryDate: formattedDate,
      };

      const payload = new FormData();
      Object.entries(fields).forEach(([key, value]) => payload.append(key, value));
      Array.from(formData.vendorReceipt || []).forEach((file) => payload.append('vendorReceipt', file));

      await postMutation({
        endpoint: '/consignment/assets/return',
        body: payload,
      });

      toast.success('Return asset request created successfully.');
      setReturnModalOpen(false);
      setSelectedAsset(null);
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

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">My Assets</h1>
      
      {assets && assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-[var(--surface-soft)] rounded-lg p-2">
                      <Laptop className="w-5 h-5 text-[var(--theme-main)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{asset.brand} {asset.model}</h3>
                      <p className="text-xs text-gray-500">{asset.assetTag}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CustomButton
                      text="Asset Received"
                      onClick={() => handleAssetReceived(asset)}
                      variant="success"
                      size="sm"
                      className={asset.consignmentStatus === 'DELIVERED' ? 'opacity-50' : ''}
                    />
                    <CustomButton
                      text="Return Asset"
                      onClick={() => handleReturnAsset(asset)}
                      variant="danger"
                      size="sm"
                    />
                    <CustomButton
                      text="Extend Lease"
                      onClick={() => handleExtendLease(asset)}
                      variant="primary"
                      size="sm"
                    />
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Cpu className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Processor</p>
                      <p className="font-medium text-gray-900">{asset.processor || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">RAM / Storage</p>
                      <p className="font-medium text-gray-900">
                        {asset.ramSizeGB ? `${asset.ramSizeGB}GB` : 'N/A'} / {asset.storageSizeGB ? `${asset.storageSizeGB}GB` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {/* Col 1 */}
                    <div className="flex flex-col gap-y-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">Status</span>
                        <span className="text-xs font-medium text-gray-900">{asset.status}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">Condition</span>
                        <span className="text-xs font-medium text-gray-900">{asset.condition}</span>
                      </div>
                      {allocation?.sourceName && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-500">Source</span>
                          <span className="text-xs font-medium text-gray-900">{allocation.sourceName}</span>
                        </div>
                      )}
                    </div>
                    {/* Col 2 */}
                    <div className="flex flex-col gap-y-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">Serial Number</span>
                        <span className="text-xs font-medium text-gray-900">{asset.serialNumber}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">Allocated Date</span>
                        <span className="text-xs font-medium text-gray-900">{allocatedDate}</span>
                      </div>
                      {allocation?.destinationName && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-500">Destination</span>
                          <span className="text-xs font-medium text-gray-900">{allocation.destinationName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accessories */}
                  <div className="flex items-center gap-3 pt-2 mt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Accessories:</span>
                    <div className="flex items-center gap-2">
                      {asset.charger && (
                        <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          Charger
                        </span>
                      )}
                      {asset.bag && (
                        <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          Bag
                        </span>
                      )}
                      {!asset.charger && !asset.bag && (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No assets assigned</p>
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
        fields={extendLeaseFields}
        onSubmit={handleExtendSubmit}
        isSubmitting={isPostPending}
        size="small"
        validationSchema={extendLeaseValidationSchema}
      />

      <FormModal
        isOpen={returnModalOpen}
        onClose={() => { setReturnModalOpen(false); setSelectedAsset(null); setCoordinatorCampusId(null); }}
        componentName=""
        actionType="Return Asset"
        fields={computedReturnFields}
        onSubmit={handleReturnSubmit}
        isSubmitting={isPostPending}
        size="medium"
        validationSchema={returnAssetValidationSchema}
        onFormDataChange={(updatedData, fieldChanged) => {
          // Trigger fetch when user selects OTHER_CAMPUS or VISIT_CAMPUS
          if (fieldChanged?.name === 'returnMode' && (updatedData.returnMode === 'OTHER_CAMPUS' || updatedData.returnMode === 'VISIT_CAMPUS')) {
            setTimeout(() => fetchCampuses(), 0);
          }

          // Auto-fill address when switching back to SOURCED_CAMPUS
          if (fieldChanged?.name === 'returnMode' && updatedData.returnMode === 'SOURCED_CAMPUS') {
            const assetAddress = selectedAsset?.campus?.address || allocationMap[selectedAsset?.id]?.userAddress || '';
            const sourceId = selectedAsset?.sourceCampusId || selectedAsset?.campusId;
            if (sourceId) {
              setTimeout(() => setCoordinatorCampusId(sourceId), 0);
            }
            return {
              ...updatedData,
              exactAddress: assetAddress,
              destinationCampusId: '',
            };
          }

          // Clear address when switching to OTHER_CAMPUS or VISIT_CAMPUS
          if (fieldChanged?.name === 'returnMode' && (updatedData.returnMode === 'OTHER_CAMPUS' || updatedData.returnMode === 'VISIT_CAMPUS')) {
            setTimeout(() => setCoordinatorCampusId(null), 0);
            return {
              ...updatedData,
              exactAddress: '',
              destinationCampusId: '',
              campusItCoordinator: '',
            };
          }

          // Handle campus selection from API autocomplete
          if (fieldChanged?.name === 'destinationCampusId' && (updatedData.returnMode === 'OTHER_CAMPUS' || updatedData.returnMode === 'VISIT_CAMPUS')) {
            const selectedCampus = campusesData.find((c) => c.id === updatedData.destinationCampusId);
            
            if (updatedData.destinationCampusId) {
              setTimeout(() => setCoordinatorCampusId(updatedData.destinationCampusId), 0);
            } else {
              setTimeout(() => setCoordinatorCampusId(null), 0);
              return {
                ...updatedData,
                exactAddress: '',
                campusItCoordinator: '',
              };
            }

            if (selectedCampus && selectedCampus.address) {
              return {
                ...updatedData,
                exactAddress: selectedCampus.address
              };
            }
          }
          return updatedData;
        }}
      />
    </div>
  );
}
