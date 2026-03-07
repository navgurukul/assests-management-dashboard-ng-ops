'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import useFetch from '@/app/hooks/query/useFetch';

export default function AllocationConsignmentSelector({
  value = {},
  onChange,
  apiUrl,
  queryKey,
  filterStatus = 'ALLOCATED',
  isDisabled = false,
  lockAllocationSelection = false,
  lockedAllocationId = '',
  lockedAllocationData = null,
}) {
  const normalizeAssets = (allocation) => {
    if (!allocation) return [];

    const directAssets = Array.isArray(allocation.assets) ? allocation.assets : [];
    if (directAssets.length > 0) {
      return directAssets.map((asset) => ({
        ...asset,
        id: asset.id || asset.assetId,
        assetId: asset.assetId || asset.id,
      }));
    }

    if (allocation.asset) {
      const asset = allocation.asset;
      const normalizedId = asset.id || asset.assetId || allocation.assetId;
      return [{
        ...asset,
        id: normalizedId,
        assetId: normalizedId,
        assetTag: asset.assetTag || normalizedId,
        assetType: asset.assetType || asset.type || 'N/A',
        status: asset.status || 'ACTIVE',
      }];
    }

    const rawAssetIds = Array.isArray(allocation.assetIds)
      ? allocation.assetIds
      : Array.isArray(allocation.assetsId)
        ? allocation.assetsId
        : [];

    return rawAssetIds.map((assetId) => ({
      id: assetId,
      assetId,
      assetTag: assetId,
      assetType: 'N/A',
      status: 'ACTIVE',
    }));
  };

  const normalizeAllocationData = (allocation) => {
    if (!allocation) return null;

    const sourceCampusName =
      allocation.sourceCampus?.campusName ||
      allocation.sourceCampus?.name ||
      allocation.sourceCampusName ||
      allocation.sourceCampusCode ||
      allocation.sourceCampusId ||
      allocation.source;

    const destinationCampusName =
      allocation.destinationCampus?.campusName ||
      allocation.destinationCampus?.name ||
      allocation.destinationCampusName ||
      allocation.destinationCampusCode ||
      allocation.destinationCampusId ||
      allocation.destination;

    return {
      ...allocation,
      assets: normalizeAssets(allocation),
      sourceCampus: allocation.sourceCampus
        ? {
            ...allocation.sourceCampus,
            name: sourceCampusName || allocation.sourceCampus?.name || 'N/A',
          }
        : sourceCampusName
          ? { name: sourceCampusName, campusName: sourceCampusName }
          : undefined,
      destinationCampus: allocation.destinationCampus
        ? {
            ...allocation.destinationCampus,
            name: destinationCampusName || allocation.destinationCampus?.name || 'N/A',
          }
        : destinationCampusName
          ? { name: destinationCampusName, campusName: destinationCampusName }
          : undefined,
      source: sourceCampusName || allocation.source || 'N/A',
      destination: destinationCampusName || allocation.destination || 'N/A',
    };
  };

  const [selectedAllocation, setSelectedAllocation] = useState(value.allocationId || '');
  const [selectedAssets, setSelectedAssets] = useState(value.selectedAssets || []);
  const [allocationDetails, setAllocationDetails] = useState(normalizeAllocationData(value.allocationDetails) || null);

  // Fetch allocations data
  const { data: allocationsData } = useFetch({
    url: apiUrl ? apiUrl.replace(/^.*\/api/, '') : '/allocations',
    queryKey: queryKey || ['allocations'],
  });

  // Filter allocations by status
  const allAllocations = React.useMemo(() => {
    return Array.isArray(allocationsData?.data) ? allocationsData.data : [];
  }, [allocationsData]);

  const allocations = React.useMemo(() => {
    let sourceData = [...allAllocations];
    
    // Filter by status if specified
    if (filterStatus) {
      sourceData = sourceData.filter(alloc => 
        alloc.status === filterStatus || alloc.status === filterStatus.toUpperCase()
      );
    }
    
    return sourceData;
  }, [allAllocations, filterStatus]);

  const getAllocationById = (id) => {
    if (!id) return null;
    const normalizedId = String(id);
    return allAllocations.find((allocation) => String(allocation.id) === normalizedId) || null;
  };

  // Handle allocation selection
  const handleAllocationChange = (e) => {
    const allocationId = e.target.value;
    setSelectedAllocation(allocationId);
    setSelectedAssets([]);
    
    if (allocationId) {
      const allocation = allocations.find((a) => String(a.id) === String(allocationId));
      const normalizedAllocation = normalizeAllocationData(allocation);
      setAllocationDetails(normalizedAllocation);
      
      onChange({
        allocationId,
        selectedAssets: [],
        allocationDetails: normalizedAllocation,
      });
    } else {
      setAllocationDetails(null);
      onChange({
        allocationId: '',
        selectedAssets: [],
        allocationDetails: null,
      });
    }
  };

  // Handle asset checkbox toggle
  const handleAssetToggle = (asset) => {
    const assetId = asset.id || asset.assetId;
    const isSelected = selectedAssets.some(a => (a.id || a.assetId) === assetId);
    
    let updatedAssets;
    if (isSelected) {
      updatedAssets = selectedAssets.filter(a => (a.id || a.assetId) !== assetId);
    } else {
      updatedAssets = [...selectedAssets, asset];
    }
    
    setSelectedAssets(updatedAssets);
    onChange({
      allocationId: selectedAllocation,
      selectedAssets: updatedAssets,
      allocationDetails,
    });
  };

  // Handle remove asset chip
  const handleRemoveAsset = (asset) => {
    const assetId = asset.id || asset.assetId;
    const updatedAssets = selectedAssets.filter(a => (a.id || a.assetId) !== assetId);
    setSelectedAssets(updatedAssets);
    onChange({
      allocationId: selectedAllocation,
      selectedAssets: updatedAssets,
      allocationDetails,
    });
  };

  // Update state when value prop changes from parent
  useEffect(() => {
    const incomingAllocationId = value.allocationId || '';
    const incomingSelectedAssets = value.selectedAssets || [];
    const incomingAllocationDetails = normalizeAllocationData(value.allocationDetails) || null;

    const selectedAssetsChanged = JSON.stringify(incomingSelectedAssets) !== JSON.stringify(selectedAssets);
    const allocationDetailsChanged = JSON.stringify(incomingAllocationDetails) !== JSON.stringify(allocationDetails);

    if (
      incomingAllocationId !== selectedAllocation ||
      selectedAssetsChanged ||
      allocationDetailsChanged
    ) {
      setSelectedAllocation(incomingAllocationId);
      setSelectedAssets(incomingSelectedAssets);
      setAllocationDetails(incomingAllocationDetails);
    }
  }, [value]);

  useEffect(() => {
    if (!lockAllocationSelection || !lockedAllocationId) return;

    const lockedId = String(lockedAllocationId);
    const fetchedAllocationById = getAllocationById(lockedId);

    const mergedLockedAllocation = {
      ...(fetchedAllocationById || {}),
      ...(lockedAllocationData || {}),
      sourceCampus:
        lockedAllocationData?.sourceCampus ||
        fetchedAllocationById?.sourceCampus,
      destinationCampus:
        lockedAllocationData?.destinationCampus ||
        fetchedAllocationById?.destinationCampus,
      assets:
        (Array.isArray(lockedAllocationData?.assets) && lockedAllocationData.assets.length > 0
          ? lockedAllocationData.assets
          : fetchedAllocationById?.assets) ||
        [],
      assetIds:
        (Array.isArray(lockedAllocationData?.assetIds) && lockedAllocationData.assetIds.length > 0
          ? lockedAllocationData.assetIds
          : fetchedAllocationById?.assetIds) ||
        [],
      assetsId:
        (Array.isArray(lockedAllocationData?.assetsId) && lockedAllocationData.assetsId.length > 0
          ? lockedAllocationData.assetsId
          : fetchedAllocationById?.assetsId) ||
        [],
    };

    const lockedAllocation = normalizeAllocationData(mergedLockedAllocation);

    if (selectedAllocation !== lockedId || !allocationDetails) {
      setSelectedAllocation(lockedId);
      setSelectedAssets([]);
      setAllocationDetails(lockedAllocation);

      onChange({
        allocationId: lockedId,
        selectedAssets: [],
        allocationDetails: lockedAllocation,
      });
    }
  }, [lockAllocationSelection, lockedAllocationId, lockedAllocationData, allocations]);

  const isAllocationLocked = lockAllocationSelection && !!lockedAllocationId;

  return (
    <div className="space-y-4">
      {/* Allocation ID */}
      {isAllocationLocked ? (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <p className="text-xs text-gray-600 mb-1">Allocation ID</p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-semibold text-gray-900 break-all">
              {allocationDetails?.allocationCode || selectedAllocation}
            </p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {allocationDetails?.status || 'ACTIVE'}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allocation ID <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedAllocation}
            onChange={handleAllocationChange}
            disabled={isDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an allocation</option>
            {allocations.map((allocation) => (
              <option key={allocation.id} value={allocation.id}>
                {allocation.allocationCode || `ALLOC-${allocation.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Allocation Details Section */}
      {allocationDetails && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">Allocation Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Assigned To</p>
              <p className="text-sm font-medium text-gray-900">
                {allocationDetails.user?.email || 
                 allocationDetails.userEmail || 
                 allocationDetails.assignedTo?.email ||
                 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Source</p>
              <p className="text-sm font-medium text-gray-900">
                {allocationDetails.sourceCampus?.name || 
                  allocationDetails.sourceCampus?.campusName ||
                 allocationDetails.source || 
                 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Destination</p>
              <p className="text-sm font-medium text-gray-900">
                {allocationDetails.destinationCampus?.name || 
                  allocationDetails.destinationCampus?.campusName ||
                 allocationDetails.destination || 
                 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Assets Chips */}
      {selectedAssets.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-900 mb-2">
            Selected Assets ({selectedAssets.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedAssets.map((asset) => (
              <div
                key={asset.id || asset.assetId}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <span>{asset.assetTag || asset.assetId}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAsset(asset)}
                  disabled={isDisabled}
                  className="hover:bg-green-700 rounded-full p-0.5 transition-colors"
                  title="Remove asset"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assets Table */}
      {allocationDetails && allocationDetails.assets && allocationDetails.assets.length > 0 && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
            <h4 className="text-sm font-semibold text-gray-900">
              Assets in this Allocation
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAssets.length === allocationDetails.assets.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssets([...allocationDetails.assets]);
                          onChange({
                            allocationId: selectedAllocation,
                            selectedAssets: [...allocationDetails.assets],
                            allocationDetails,
                          });
                        } else {
                          setSelectedAssets([]);
                          onChange({
                            allocationId: selectedAllocation,
                            selectedAssets: [],
                            allocationDetails,
                          });
                        }
                      }}
                      disabled={isDisabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Asset Tag
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Asset Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {allocationDetails.assets.map((asset) => {
                  const assetId = asset.id || asset.assetId;
                  const isSelected = selectedAssets.some(a => (a.id || a.assetId) === assetId);
                  
                  return (
                    <tr
                      key={assetId}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => !isDisabled && handleAssetToggle(asset)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleAssetToggle(asset)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={isDisabled}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {asset.assetTag || asset.assetId || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.assetType || asset.type || 'Laptop'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3" />
                          {asset.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Assets Message */}
      {allocationDetails && (!allocationDetails.assets || allocationDetails.assets.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <p>No assets found in this allocation.</p>
        </div>
      )}
    </div>
  );
}
