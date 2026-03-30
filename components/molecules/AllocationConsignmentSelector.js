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
    const nestedAssets = Array.isArray(allocation.assets?.items) ? allocation.assets.items : [];
    const assetsFromPayload = directAssets.length > 0 ? directAssets : nestedAssets;

    if (assetsFromPayload.length > 0) {
      return assetsFromPayload.map((asset) => ({
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
  };

  const normalizeAllocationData = (allocation) => {
    if (!allocation) return null;

    const hasSourceCampusObject = !!allocation.sourceCampus && typeof allocation.sourceCampus === 'object';
    const hasDestinationCampusObject = !!allocation.destinationCampus && typeof allocation.destinationCampus === 'object';

    const sourceCampusName =
      (hasSourceCampusObject ? allocation.sourceCampus?.campusName : '') ||
      (hasSourceCampusObject ? allocation.sourceCampus?.name : '') ||
      (typeof allocation.sourceCampus === 'string' ? allocation.sourceCampus : '') ||
      allocation.sourceName ||
      allocation.sourceCampusName ||
      allocation.sourceCampusCode ||
      allocation.source;

    const destinationCampusName =
      (hasDestinationCampusObject ? allocation.destinationCampus?.campusName : '') ||
      (hasDestinationCampusObject ? allocation.destinationCampus?.name : '') ||
      (typeof allocation.destinationCampus === 'string' ? allocation.destinationCampus : '') ||
      allocation.destinationName ||
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
      sourceName: sourceCampusName || allocation.sourceName || 'N/A',
      destinationName: destinationCampusName || allocation.destinationName || 'N/A',
    };
  };

  const [selectedAllocation, setSelectedAllocation] = useState(value.allocationId || '');
  const [selectedAssets, setSelectedAssets] = useState(value.selectedAssets || []);
  const [allocationDetails, setAllocationDetails] = useState(normalizeAllocationData(value.allocationDetails) || null);
  const [assetTagsByFetchedId, setAssetTagsByFetchedId] = useState({});
  const [assetTypesByFetchedId, setAssetTypesByFetchedId] = useState({});
  const [attemptedAssetTagLookupById, setAttemptedAssetTagLookupById] = useState({});
  const [currentAssetLookupId, setCurrentAssetLookupId] = useState('');
  const shouldUseLockedDataOnly = lockAllocationSelection && !!lockedAllocationData;

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

  // Fetch allocations data
  const { data: allocationsData } = useFetch({
    url: apiUrl ? apiUrl.replace(/^.*\/api/, '') : '/allocations',
    queryKey: queryKey || ['allocations'],
    enabled: !shouldUseLockedDataOnly,
  });

  const { data: campusesData } = useFetch({
    url: '/campuses',
    queryKey: ['campuses', 'allocation-consignment-selector'],
    enabled: !shouldUseLockedDataOnly,
  });

  const { data: assetsData } = useFetch({
    url: '/assets',
    queryKey: ['assets', 'allocation-consignment-selector'],
    enabled: !shouldUseLockedDataOnly,
  });

  // Filter allocations by status
  const allAllocations = React.useMemo(() => {
    if (shouldUseLockedDataOnly && lockedAllocationData) {
      return [lockedAllocationData];
    }
    return Array.isArray(allocationsData?.data) ? allocationsData.data : [];
  }, [allocationsData, shouldUseLockedDataOnly, lockedAllocationData]);

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

  const campusNameById = React.useMemo(() => {
    const map = new Map();
    const campuses = Array.isArray(campusesData?.data) ? campusesData.data : [];

    campuses.forEach((campus) => {
      const campusId = String(campus?.id || '').trim();
      const campusName = campus?.campusName || campus?.name || '';
      if (campusId && campusName) {
        map.set(campusId, campusName);
      }
    });

    return map;
  }, [campusesData]);

  const assetTagById = React.useMemo(() => {
    const map = new Map();

    const setTag = (idCandidate, tagCandidate) => {
      const id = String(idCandidate || '').trim();
      const tag = String(tagCandidate || '').trim();
      if (!id || !tag || id === tag || map.has(id)) return;
      map.set(id, tag);
    };

    const addFromAssets = (assets) => {
      if (!Array.isArray(assets)) return;
      assets.forEach((asset) => {
        if (!asset) return;
        setTag(asset.id || asset.assetId, asset.assetTag || asset.tag);
      });
    };

    allAllocations.forEach((allocation) => {
      addFromAssets(allocation?.assets);
      if (allocation?.asset) {
        setTag(
          allocation.asset.id || allocation.asset.assetId || allocation.assetId,
          allocation.asset.assetTag || allocation.asset.tag
        );
      }
    });

    const apiAssets =
      (Array.isArray(assetsData?.data?.assets) && assetsData.data.assets) ||
      (Array.isArray(assetsData?.data) && assetsData.data) ||
      (Array.isArray(assetsData?.assets) && assetsData.assets) ||
      (Array.isArray(assetsData) && assetsData) ||
      [];

    addFromAssets(apiAssets);

    return map;
  }, [allAllocations, assetsData]);

  const assetTypeById = React.useMemo(() => {
    const map = new Map();

    const setType = (idCandidate, typeCandidate) => {
      const id = String(idCandidate || '').trim();
      const type = getAssetTypeLabel(typeCandidate);
      if (!id || !type || map.has(id)) return;
      map.set(id, type);
    };

    const addFromAssets = (assets) => {
      if (!Array.isArray(assets)) return;
      assets.forEach((asset) => {
        if (!asset) return;
        setType(asset.id || asset.assetId, asset.assetType || asset.type || asset.assetTypeName);
      });
    };

    allAllocations.forEach((allocation) => {
      addFromAssets(allocation?.assets);
      if (allocation?.asset) {
        setType(
          allocation.asset.id || allocation.asset.assetId || allocation.assetId,
          allocation.asset.assetType || allocation.asset.type || allocation.asset.assetTypeName
        );
      }
    });

    const apiAssets =
      (Array.isArray(assetsData?.data?.assets) && assetsData.data.assets) ||
      (Array.isArray(assetsData?.data) && assetsData.data) ||
      (Array.isArray(assetsData?.assets) && assetsData.assets) ||
      (Array.isArray(assetsData) && assetsData) ||
      [];

    addFromAssets(apiAssets);

    return map;
  }, [allAllocations, assetsData]);

  const getAssetId = (asset) => String(asset?.id || asset?.assetId || '').trim();

  const unresolvedAssetIds = React.useMemo(() => {
    const assets = Array.isArray(allocationDetails?.assets) ? allocationDetails.assets : [];

    return assets
      .map((asset) => ({
        id: getAssetId(asset),
        directTag: String(asset?.assetTag || '').trim(),
        directType: getAssetTypeLabel(asset?.assetType || asset?.type),
      }))
      .filter(({ id, directTag, directType }) => {
        if (!id) return false;
        const tagResolved = (directTag && directTag !== id) || assetTagById.has(id) || !!assetTagsByFetchedId[id];
        const typeResolved = !!directType || assetTypeById.has(id) || !!assetTypesByFetchedId[id];
        if (tagResolved && typeResolved) return false;
        if (attemptedAssetTagLookupById[id]) return false;
        return true;
      })
      .map(({ id }) => id);
  }, [allocationDetails, assetTagById, assetTagsByFetchedId, assetTypeById, assetTypesByFetchedId, attemptedAssetTagLookupById]);

  const { data: unresolvedAssetByIdData, isError: isUnresolvedAssetByIdError } = useFetch({
    url: currentAssetLookupId ? `/assets/${currentAssetLookupId}` : '/assets',
    queryKey: ['assets', 'allocation-consignment-selector', 'detail-by-id', currentAssetLookupId],
    enabled: !!currentAssetLookupId && !shouldUseLockedDataOnly,
  });

  useEffect(() => {
    if (shouldUseLockedDataOnly) return;
    if (currentAssetLookupId) return;
    if (!unresolvedAssetIds.length) return;
    setCurrentAssetLookupId(unresolvedAssetIds[0]);
  }, [unresolvedAssetIds, currentAssetLookupId, shouldUseLockedDataOnly]);

  useEffect(() => {
    if (!currentAssetLookupId) return;
    if (typeof unresolvedAssetByIdData === 'undefined' && !isUnresolvedAssetByIdError) return;

    const payload = unresolvedAssetByIdData?.data || unresolvedAssetByIdData;
    const assetData = payload?.asset || payload;
    const resolvedTag = String(assetData?.assetTag || assetData?.tag || '').trim();
    const resolvedType = getAssetTypeLabel(assetData?.assetType || assetData?.type || assetData?.assetTypeName);

    setAttemptedAssetTagLookupById((prev) => ({
      ...prev,
      [currentAssetLookupId]: true,
    }));

    if (resolvedTag && resolvedTag !== currentAssetLookupId) {
      setAssetTagsByFetchedId((prev) => ({
        ...prev,
        [currentAssetLookupId]: resolvedTag,
      }));
    }

    if (resolvedType) {
      setAssetTypesByFetchedId((prev) => ({
        ...prev,
        [currentAssetLookupId]: resolvedType,
      }));
    }

    setCurrentAssetLookupId('');
  }, [currentAssetLookupId, unresolvedAssetByIdData, isUnresolvedAssetByIdError]);

  const getAssetTag = (asset) => {
    const assetId = getAssetId(asset);
    const directTag = String(asset?.assetTag || '').trim();

    if (directTag && directTag !== assetId) {
      return directTag;
    }

    if (assetId && assetTagsByFetchedId[assetId]) {
      return assetTagsByFetchedId[assetId];
    }

    if (assetId && assetTagById.has(assetId)) {
      return assetTagById.get(assetId);
    }

    return 'N/A';
  };

  const getAssetType = (asset) => {
    const assetId = getAssetId(asset);
    const directType = getAssetTypeLabel(asset?.assetType || asset?.type);

    if (directType) {
      return directType;
    }

    if (assetId && assetTypesByFetchedId[assetId]) {
      return assetTypesByFetchedId[assetId];
    }

    if (assetId && assetTypeById.has(assetId)) {
      return assetTypeById.get(assetId);
    }

    return 'N/A';
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

        const candidateId = String(candidate.id || candidate.campusId || '').trim();
        if (candidateId && campusNameById.has(candidateId)) {
          return campusNameById.get(candidateId);
        }
        continue;
      }

      const value = String(candidate).trim();
      if (!value) continue;

      if (campusNameById.has(value)) {
        return campusNameById.get(value);
      }

      if (!isLikelyCampusId(value)) {
        return value;
      }
    }

    return 'N/A';
  };

  const getAllocationById = (id) => {
    if (!id) return null;
    const normalizedId = String(id);
    return allAllocations.find((allocation) => String(allocation.id) === normalizedId) || null;
  };

  const selectedAllocationFromList = React.useMemo(() => {
    return getAllocationById(selectedAllocation);
  }, [selectedAllocation, allAllocations]);

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
      allocationId: selectedAllocation,
      selectedAssets: updatedAssets,
      allocationDetails,
    });
  };

  // Handle remove asset chip
  const handleRemoveAsset = (asset) => {
    const assetId = getAssetId(asset);
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

    const hasCampusObject = (campus) => {
      return !!campus && typeof campus === 'object' && (campus.campusName || campus.name);
    };

    const resolvedSourceCampus = hasCampusObject(lockedAllocationData?.sourceCampus)
      ? lockedAllocationData.sourceCampus
      : hasCampusObject(fetchedAllocationById?.sourceCampus)
        ? fetchedAllocationById.sourceCampus
        : lockedAllocationData?.sourceCampus || fetchedAllocationById?.sourceCampus;

    const resolvedDestinationCampus = hasCampusObject(lockedAllocationData?.destinationCampus)
      ? lockedAllocationData.destinationCampus
      : hasCampusObject(fetchedAllocationById?.destinationCampus)
        ? fetchedAllocationById.destinationCampus
        : lockedAllocationData?.destinationCampus || fetchedAllocationById?.destinationCampus;

    const mergedLockedAllocation = {
      ...(fetchedAllocationById || {}),
      ...(lockedAllocationData || {}),
      sourceCampus: resolvedSourceCampus,
      destinationCampus: resolvedDestinationCampus,
      assets:
        (Array.isArray(lockedAllocationData?.assets) && lockedAllocationData.assets.length > 0
          ? lockedAllocationData.assets
          : Array.isArray(lockedAllocationData?.assets?.items) && lockedAllocationData.assets.items.length > 0
            ? lockedAllocationData.assets.items
            : Array.isArray(fetchedAllocationById?.assets)
              ? fetchedAllocationById.assets
              : Array.isArray(fetchedAllocationById?.assets?.items)
                ? fetchedAllocationById.assets.items
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
              <p className="text-xs text-gray-600 mb-1">Allocated To</p>
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
                {resolveCampusLabel(
                  selectedAllocationFromList?.sourceCampus,
                  selectedAllocationFromList?.sourceCampusName,
                  selectedAllocationFromList?.source,
                  selectedAllocationFromList?.sourceCampusId,
                  allocationDetails.sourceCampus,
                  allocationDetails.sourceCampusId,
                  allocationDetails.sourceCampusName,
                  allocationDetails.source
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Destination</p>
              <p className="text-sm font-medium text-gray-900">
                {resolveCampusLabel(
                  selectedAllocationFromList?.destinationCampus,
                  selectedAllocationFromList?.destinationCampusName,
                  selectedAllocationFromList?.destination,
                  selectedAllocationFromList?.destinationCampusId,
                  allocationDetails.destinationCampus,
                  allocationDetails.destinationCampusId,
                  allocationDetails.destinationCampusName,
                  allocationDetails.destination
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
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Processor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    RAM
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Storage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Serial Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Condition
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Spec Label
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {allocationDetails.assets.map((asset) => {
                  const assetId = getAssetId(asset);
                  const isSelected = selectedAssets.some(a => (a.id || a.assetId) === assetId);

                  return (
                    <tr
                      key={assetId}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
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
                          {asset.processor || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.ramSizeGB ? `${asset.ramSizeGB} GB` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {asset.storageSizeGB ? `${asset.storageSizeGB} GB` : 'N/A'}
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
                          {asset.specLabel || 'N/A'}
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
