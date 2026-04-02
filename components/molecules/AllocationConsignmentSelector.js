'use client';

import React, { useCallback, useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export default function AllocationConsignmentSelector({
  value = {},
  onChange,
  filterStatus = 'ALLOCATED',
  isDisabled = false,
  lockAllocationSelection = false,
  lockedAllocationId = '',
  lockedAllocationData = null,
}) {
  const normalizeAssets = useCallback((allocation) => {
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
      assetTag: '',
      assetType: 'N/A',
      status: 'ACTIVE',
    }));
  }, []);

  const normalizeAllocationData = useCallback((allocation) => {
    if (!allocation) return null;

    const hasSourceCampusObject = !!allocation.sourceCampus && typeof allocation.sourceCampus === 'object';
    const hasDestinationCampusObject = !!allocation.destinationCampus && typeof allocation.destinationCampus === 'object';

    const sourceCampusName =
      (hasSourceCampusObject ? allocation.sourceCampus?.campusName : '') ||
      (hasSourceCampusObject ? allocation.sourceCampus?.name : '') ||
      (typeof allocation.sourceCampus === 'string' ? allocation.sourceCampus : '') ||
      allocation.sourceCampusName ||
      allocation.sourceCampusCode ||
      allocation.source;

    const destinationCampusName =
      (hasDestinationCampusObject ? allocation.destinationCampus?.campusName : '') ||
      (hasDestinationCampusObject ? allocation.destinationCampus?.name : '') ||
      (typeof allocation.destinationCampus === 'string' ? allocation.destinationCampus : '') ||
      allocation.destinationCampusName ||
      allocation.destinationCampusCode ||
      allocation.destination;

    return {
      ...allocation,
      assets: normalizeAssets(allocation),
      sourceCampus: hasSourceCampusObject
        ? {
            ...allocation.sourceCampus,
            name: sourceCampusName || allocation.sourceCampus?.name || 'N/A',
          }
        : sourceCampusName
          ? { name: sourceCampusName, campusName: sourceCampusName }
          : undefined,
      destinationCampus: hasDestinationCampusObject
        ? {
            ...allocation.destinationCampus,
            name: destinationCampusName || allocation.destinationCampus?.name || 'N/A',
          }
        : destinationCampusName
          ? { name: destinationCampusName, campusName: destinationCampusName }
          : undefined,
      source: sourceCampusName || allocation.source || (typeof allocation.sourceCampus === 'string' ? allocation.sourceCampus : '') || 'N/A',
      destination: destinationCampusName || allocation.destination || (typeof allocation.destinationCampus === 'string' ? allocation.destinationCampus : '') || 'N/A',
    };
  }, [normalizeAssets]);

  const [selectedAllocation, setSelectedAllocation] = useState(value.allocationId || '');
  const [selectedAssets, setSelectedAssets] = useState(value.selectedAssets || []);
  const [allocationDetails, setAllocationDetails] = useState(normalizeAllocationData(value.allocationDetails) || null);

  const getAssetTypeLabel = (value) => {
    if (!value) return '';
    if (typeof value === 'string') {
      const normalized = value.trim();
      return normalized && normalized !== 'N/A' ? normalized : '';
    }
    if (typeof value === 'object') {
      const candidate = value.name || value.assetTypeName || value.type || value.label || value.value || '';
      const normalized = String(candidate || '').trim();
      return normalized && normalized !== 'N/A' ? normalized : '';
    }
    const normalized = String(value).trim();
    return normalized && normalized !== 'N/A' ? normalized : '';
  };

  const allAllocations = React.useMemo(() => {
    const fallbackCandidates = [value?.allocationDetails, lockedAllocationData].filter(Boolean);
    const fallbackAllocations = fallbackCandidates.map((allocation) => normalizeAllocationData(allocation));

    const deduped = [];
    const seen = new Set();
    fallbackAllocations.forEach((allocation) => {
      const id = String(allocation?.id || allocation?.allocationId || '').trim();
      if (!id || seen.has(id)) return;
      seen.add(id);
      deduped.push(allocation);
    });

    return deduped;
  }, [value?.allocationDetails, lockedAllocationData, normalizeAllocationData]);

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

  const getAssetId = (asset) => String(asset?.id || asset?.assetId || '').trim();

  const getAssetTag = (asset) => {
    const directTag = String(asset?.assetTag || '').trim();

    return directTag || 'N/A';
  };

  const getAssetType = (asset) => {
    const directType = getAssetTypeLabel(asset?.assetType || asset?.type);

    return directType || 'N/A';
  };

  const isLikelyCampusId = (value) => {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    return /^[a-f0-9-]{16,}$/i.test(trimmed) && !/\s/.test(trimmed);
  };

  const resolveCampusLabel = (...candidates) => {
    for (const candidate of candidates) {
      if (!candidate) continue;

      if (typeof candidate === 'object') {
        const directName = candidate.campusName || candidate.name;
        if (directName) return directName;
        continue;
      }

      const value = String(candidate).trim();
      if (!value) continue;

      if (!isLikelyCampusId(value)) {
        return value;
      }
    }

    return 'N/A';
  };

  const getAssigneeName = (details) => {
    if (!details) return 'Not assigned';

    return (
      details.assigneeName ||
      details.user?.name ||
      [details.user?.firstName, details.user?.lastName].filter(Boolean).join(' ') ||
      details.user?.username ||
      details.assignedTo?.name ||
      details.assignedTo?.username ||
      details.userName ||
      details.userEmail ||
      details.user?.email ||
      details.assignedTo?.email ||
      'Not assigned'
    );
  };

  const isAllocationLocked = lockAllocationSelection && !!lockedAllocationId;

  const lockedAllocationDetails = React.useMemo(() => {
    if (!isAllocationLocked) return null;

    const lockedId = String(lockedAllocationId);
    const fallbackAllocationById = allAllocations.find(
      (allocation) => String(allocation.id) === lockedId
    ) || null;

    const hasCampusObject = (campus) => {
      return !!campus && typeof campus === 'object' && (campus.campusName || campus.name);
    };

    const resolvedSourceCampus = hasCampusObject(lockedAllocationData?.sourceCampus)
      ? lockedAllocationData.sourceCampus
      : hasCampusObject(fallbackAllocationById?.sourceCampus)
        ? fallbackAllocationById.sourceCampus
        : lockedAllocationData?.sourceCampus || fallbackAllocationById?.sourceCampus;

    const resolvedDestinationCampus = hasCampusObject(lockedAllocationData?.destinationCampus)
      ? lockedAllocationData.destinationCampus
      : hasCampusObject(fallbackAllocationById?.destinationCampus)
        ? fallbackAllocationById.destinationCampus
        : lockedAllocationData?.destinationCampus || fallbackAllocationById?.destinationCampus;

    const mergedLockedAllocation = {
      ...(fallbackAllocationById || {}),
      ...(lockedAllocationData || {}),
      sourceCampus: resolvedSourceCampus,
      destinationCampus: resolvedDestinationCampus,
      assets:
        (Array.isArray(lockedAllocationData?.assets) && lockedAllocationData.assets.length > 0
          ? lockedAllocationData.assets
          : fallbackAllocationById?.assets) ||
        [],
      assetIds:
        (Array.isArray(lockedAllocationData?.assetIds) && lockedAllocationData.assetIds.length > 0
          ? lockedAllocationData.assetIds
          : fallbackAllocationById?.assetIds) ||
        [],
      assetsId:
        (Array.isArray(lockedAllocationData?.assetsId) && lockedAllocationData.assetsId.length > 0
          ? lockedAllocationData.assetsId
          : fallbackAllocationById?.assetsId) ||
        [],
    };

    return normalizeAllocationData(mergedLockedAllocation);
  }, [
    isAllocationLocked,
    lockedAllocationId,
    lockedAllocationData,
    allAllocations,
    normalizeAllocationData,
  ]);

  const currentSelectedAllocation = isAllocationLocked ? String(lockedAllocationId) : selectedAllocation;
  const currentAllocationDetails = isAllocationLocked ? lockedAllocationDetails : allocationDetails;
  const selectableAssets = Array.isArray(currentAllocationDetails?.assets)
    ? currentAllocationDetails.assets.filter((asset) => !asset?.isConsignementCreated)
    : [];

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
    const assetId = getAssetId(asset);
    const isSelected = selectedAssets.some(a => (a.id || a.assetId) === assetId);
    
    let updatedAssets;
    if (isSelected) {
      updatedAssets = selectedAssets.filter(a => (a.id || a.assetId) !== assetId);
    } else {
      updatedAssets = [...selectedAssets, asset];
    }
    
    setSelectedAssets(updatedAssets);
    onChange({
      allocationId: currentSelectedAllocation,
      selectedAssets: updatedAssets,
      allocationDetails: currentAllocationDetails,
    });
  };

  // Handle remove asset chip
  const handleRemoveAsset = (asset) => {
    const assetId = getAssetId(asset);
    const updatedAssets = selectedAssets.filter(a => (a.id || a.assetId) !== assetId);
    setSelectedAssets(updatedAssets);
    onChange({
      allocationId: currentSelectedAllocation,
      selectedAssets: updatedAssets,
      allocationDetails: currentAllocationDetails,
    });
  };

  return (
    <div className="space-y-4">
      {/* Allocation ID */}
      {isAllocationLocked ? (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <p className="text-xs text-gray-600 mb-1">Allocation ID</p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-semibold text-gray-900 break-all">
              {currentAllocationDetails?.allocationCode || currentSelectedAllocation}
            </p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {currentAllocationDetails?.status || 'ACTIVE'}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allocation ID <span className="text-red-500">*</span>
          </label>
          <select
            value={currentSelectedAllocation}
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
      {currentAllocationDetails && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">Allocation Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Assignee Name</p>
              <p className="text-sm font-medium text-gray-900">
                {getAssigneeName(currentAllocationDetails)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Source Campus</p>
              <p className="text-sm font-medium text-gray-900">
                {resolveCampusLabel(
                  currentAllocationDetails.sourceCampusDisplay,
                  currentAllocationDetails.sourceCampus,
                  currentAllocationDetails.sourceCampusId,
                  currentAllocationDetails.sourceCampusName,
                  currentAllocationDetails.source
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Destination Campus</p>
              <p className="text-sm font-medium text-gray-900">
                {resolveCampusLabel(
                  currentAllocationDetails.destinationCampusDisplay,
                  currentAllocationDetails.destinationCampus,
                  currentAllocationDetails.destinationCampusId,
                  currentAllocationDetails.destinationCampusName,
                  currentAllocationDetails.destination
                )}
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
                <span>{getAssetTag(asset)}</span>
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
      {currentAllocationDetails && currentAllocationDetails.assets && currentAllocationDetails.assets.length > 0 && (
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
                      checked={selectableAssets.length > 0 && selectedAssets.length === selectableAssets.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssets([...selectableAssets]);
                          onChange({
                            allocationId: currentSelectedAllocation,
                            selectedAssets: [...selectableAssets],
                            allocationDetails: currentAllocationDetails,
                          });
                        } else {
                          setSelectedAssets([]);
                          onChange({
                            allocationId: currentSelectedAllocation,
                            selectedAssets: [],
                            allocationDetails: currentAllocationDetails,
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
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Spec Label
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Processor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    RAM (GB)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Storage (GB)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Serial Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Condition
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Source Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentAllocationDetails.assets.map((asset) => {
                  const assetId = getAssetId(asset);
                  const isConsignmentCreated = asset?.isConsignementCreated === true;
                  const isSelected = selectedAssets.some(a => (a.id || a.assetId) === assetId);
                  
                  return (
                    <tr
                      key={assetId}
                      className={`cursor-pointer transition-colors ${
                        isConsignmentCreated
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : isSelected
                            ? 'bg-blue-50'
                            : 'hover:bg-gray-50'
                      }`}
                      onClick={() => !isDisabled && !isConsignmentCreated && handleAssetToggle(asset)}
                    >
                      <td className="px-4 py-3">
                        {!isConsignmentCreated && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleAssetToggle(asset)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isDisabled}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {getAssetTag(asset)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {getAssetType(asset)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.brand || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.model || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.specLabel || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.processor || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.ramSizeGB || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.storageSizeGB || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.serialNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.condition || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.sourceType || 'N/A'}
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
      {currentAllocationDetails && (!currentAllocationDetails.assets || currentAllocationDetails.assets.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <p>No assets found in this allocation.</p>
        </div>
      )}
    </div>
  );
}
