'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import useFetch from '@/app/hooks/query/useFetch';
import { allocationsListData } from '@/dummyJson/dummyJson';

export default function AllocationConsignmentSelector({
  value = {},
  onChange,
  apiUrl,
  queryKey,
  filterStatus = 'ALLOCATED',
  isDisabled = false,
}) {
  const [selectedAllocation, setSelectedAllocation] = useState(value.allocationId || '');
  const [selectedAssets, setSelectedAssets] = useState(value.selectedAssets || []);
  const [allocationDetails, setAllocationDetails] = useState(value.allocationDetails || null);

  // Fetch allocations data
  const { data: allocationsData } = useFetch({
    url: apiUrl ? apiUrl.replace(/^.*\/api/, '') : '/allocations',
    queryKey: queryKey || ['allocations'],
  });

  // Filter allocations by status
  const allocations = React.useMemo(() => {
    let sourceData = (allocationsData && allocationsData.data) ? allocationsData.data : allocationsListData;
    
    // Filter by status if specified
    if (filterStatus) {
      sourceData = sourceData.filter(alloc => 
        alloc.status === filterStatus || alloc.status === filterStatus.toUpperCase()
      );
    }
    
    return sourceData;
  }, [allocationsData, filterStatus]);

  // Handle allocation selection
  const handleAllocationChange = (e) => {
    const allocationId = e.target.value;
    setSelectedAllocation(allocationId);
    setSelectedAssets([]);
    
    if (allocationId) {
      const allocation = allocations.find(a => a.id === parseInt(allocationId));
      setAllocationDetails(allocation);
      
      onChange({
        allocationId,
        selectedAssets: [],
        allocationDetails: allocation,
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
    if (value.allocationId !== selectedAllocation) {
      setSelectedAllocation(value.allocationId || '');
      setSelectedAssets(value.selectedAssets || []);
      setAllocationDetails(value.allocationDetails || null);
    }
  }, [value]);

  return (
    <div className="space-y-4">
      {/* Allocation ID Dropdown */}
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
                 allocationDetails.source || 
                 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Destination</p>
              <p className="text-sm font-medium text-gray-900">
                {allocationDetails.destinationCampus?.name || 
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
