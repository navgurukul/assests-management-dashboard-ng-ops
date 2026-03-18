'use client';

import { useState, useMemo } from 'react';
import { Package, Laptop, HardDrive, Cpu, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import FormModal from '@/components/molecules/FormModal';
import CustomButton from '@/components/atoms/CustomButton';
import StatusChip from '@/components/atoms/StatusChip';
import { getConditionChipColor } from '@/app/utils/statusHelpers';
import usePost from '@/app/hooks/query/usePost';
import { toast } from '@/app/utils/toast';
import {
  getReturnAssetFields,
  returnAssetValidationSchema,
} from '@/app/config/formConfigs/returnAssetModalConfig';
import {
  extendLeaseFields,
  extendLeaseValidationSchema,
} from '@/app/config/formConfigs/extendLeaseModalConfig';

export default function MyAssetsTab({ userAssets, isLoadingAssets, assetsError }) {
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [receivedModalOpen, setReceivedModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAllocationId, setSelectedAllocationId] = useState(null);

  // Single React Query mutation — reused for all POST calls in this tab
  const { mutateAsync, isPending } = usePost();

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
        };
      });
    });
    return map;
  }, [allocations]);

  const computedReturnFields = useMemo(
    () => getReturnAssetFields(selectedAsset, allocationMap[selectedAsset?.id]?.sourceName),
    [selectedAsset, allocationMap]
  );

  const handleExtendLease = (asset) => {
    setSelectedAsset(asset);
    setSelectedAllocationId(allocationMap[asset.id]?.id || null);
    setExtendModalOpen(true);
  };

  const handleReturnAsset = (asset) => {
    setSelectedAsset(asset);
    setReturnModalOpen(true);
  };

  const handleAssetReceived = async (asset) => {
    try {
      await mutateAsync({
        endpoint: `/allocations/my-assets/${asset.id}/received`,
        body: { assetId: asset.id },
      });
      toast.success('Asset received confirmation submitted successfully.');
    } catch (err) {
      toast.error(err?.message || 'Failed to confirm asset received.');
    }
  };

  const handleReturnSubmit = async (formData) => {
    try {
      const fields = {
        assetId: selectedAsset?.id,
        assetSourceCampus: formData.assetSource,
        campusITCoordinatorEmail: formData.campusItCoordinator,
        exactAddress: formData.exactAddress,
        vendorName: formData.vendorName,
        managerEmail: formData.managerEmail,
        expectedDeliveryDate: formData.expectedDeliveryDate,
      };

      const payload = new FormData();
      Object.entries(fields).forEach(([key, value]) => payload.append(key, value));
      Array.from(formData.vendorReceipt || []).forEach((file) => payload.append('vendorReceipt', file));

      await mutateAsync({
        endpoint: '/allocations/my-assets/return',
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
      await mutateAsync({
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
        <p className="mt-2 text-sm text-red-500">{assetsError}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">My Assets</h2>
      
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
                    <div className="bg-blue-100 rounded-lg p-2">
                      <Laptop className="w-5 h-5 text-blue-600" />
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
        isOpen={extendModalOpen}
        onClose={() => { setExtendModalOpen(false); setSelectedAsset(null); setSelectedAllocationId(null); }}
        componentName=""
        actionType="Extend Lease"
        fields={extendLeaseFields}
        onSubmit={handleExtendSubmit}
        isSubmitting={isPending}
        size="small"
        validationSchema={extendLeaseValidationSchema}
      />

      <FormModal
        isOpen={returnModalOpen}
        onClose={() => { setReturnModalOpen(false); setSelectedAsset(null); }}
        componentName=""
        actionType="Return Asset"
        fields={computedReturnFields}
        onSubmit={handleReturnSubmit}
        isSubmitting={isPending}
        size="medium"
        validationSchema={returnAssetValidationSchema}
      />
    </div>
  );
}
