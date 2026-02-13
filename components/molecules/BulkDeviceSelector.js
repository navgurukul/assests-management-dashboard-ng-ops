'use client';

import React, { useState, useMemo } from 'react';
import { Package, X } from 'lucide-react';
import CustomButton from '../atoms/CustomButton';
import Modal from './Modal';
import TableWrapper from '../Table/TableWrapper';
import SearchInput from './SearchInput';
import useFetch from '@/app/hooks/query/useFetch';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asset-dashboard.navgurukul.org/api';

export default function BulkDeviceSelector({ selectedAssets = [], onChange, assetTypeId = null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedAssets, setCheckedAssets] = useState(new Set(selectedAssets.map(a => a.id)));
  const [searchTerm, setSearchTerm] = useState('');

  // Build API URL with assetType filter
  const apiUrl = assetTypeId ? `${baseUrl}/assets?type=${assetTypeId}` : `${baseUrl}/assets`;
  
  // Fetch assets from API
  const { data, isLoading, isError } = useFetch({
    url: apiUrl,
    queryKey: ['assets-bulk', assetTypeId],
    enabled: !!assetTypeId, // Only fetch when assetType is selected
  });

  // Extract assets from API response
  const availableAssets = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];
    return data.data.map(asset => ({
      id: asset.id,
      assetId: asset.assetTag,
      assetType: asset.assetType?.name || 'N/A',
      brand: asset.brand,
      model: asset.model,
      condition: asset.condition,
      workingCondition: asset.condition || 'WORKING', // Add workingCondition field for validation
      status: asset.status,
    }));
  }, [data]);

  // Filter assets based on search term
  const filteredAssets = useMemo(() => {
    if (!searchTerm) return availableAssets;
    const lowerSearch = searchTerm.toLowerCase();
    return availableAssets.filter(asset => 
      asset.assetId.toLowerCase().includes(lowerSearch) ||
      asset.assetType.toLowerCase().includes(lowerSearch) ||
      asset.brand?.toLowerCase().includes(lowerSearch) ||
      asset.model?.toLowerCase().includes(lowerSearch) ||
      asset.condition?.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, availableAssets]);

  const handleCheckboxChange = (asset) => {
    console.log('handleCheckboxChange called for asset:', asset.id);
    setCheckedAssets((prevCheckedAssets) => {
      const newCheckedAssets = new Set(prevCheckedAssets);
      if (newCheckedAssets.has(asset.id)) {
        newCheckedAssets.delete(asset.id);
      } else {
        newCheckedAssets.add(asset.id);
      }
      return newCheckedAssets;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setCheckedAssets(new Set(filteredAssets.map(a => a.id)));
    } else {
      setCheckedAssets(new Set());
    }
  };

  const handleRemoveChip = (assetId) => {
    const newCheckedAssets = new Set(checkedAssets);
    newCheckedAssets.delete(assetId);
    setCheckedAssets(newCheckedAssets);
  };

  const handleSaveSelection = () => {
    const selected = availableAssets.filter(asset => checkedAssets.has(asset.id));
    onChange(selected);
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    // Initialize checked assets from current selection
    setCheckedAssets(new Set(selectedAssets.map(a => a.id)));
    setSearchTerm('');
    setIsModalOpen(true);
  };

  const getConditionBadge = (condition) => {
    const badges = {
      WORKING: 'bg-green-100 text-green-800',
      MINOR_ISSUES: 'bg-yellow-100 text-yellow-800',
      NOT_WORKING: 'bg-red-100 text-red-800',
    };
    return badges[condition] || 'bg-gray-100 text-gray-800';
  };

  const getConditionLabel = (condition) => {
    if (!condition) return 'N/A';
    return condition.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  // Table columns configuration
  const columns = [
    { key: 'select', label: '', className: 'w-12' },
    { key: 'assetId', label: 'Asset Tag' },
    { key: 'brand', label: 'Brand' },
    { key: 'model', label: 'Model' },
    { key: 'condition', label: 'Condition' },
  ];

  // Custom render for table cells
  const renderCell = (asset, columnKey) => {
    switch (columnKey) {
      case 'select':
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={checkedAssets.has(asset.id)}
              onChange={(e) => {
                e.stopPropagation();
                handleCheckboxChange(asset);
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        );
      case 'assetId':
        return <span className="font-medium text-gray-900">{asset.assetId}</span>;
      case 'brand':
        return <span className="text-gray-700">{asset.brand || 'N/A'}</span>;
      case 'model':
        return <span className="text-gray-700">{asset.model || 'N/A'}</span>;
      case 'condition':
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getConditionBadge(asset.condition)}`}>
            {getConditionLabel(asset.condition)}
          </span>
        );
      default:
        return asset[columnKey];
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Selection Display */}
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Selected Assets ({selectedAssets.length})</h4>
          <CustomButton
            text="Select Bulk Devices"
            onClick={handleOpenModal}
            variant="secondary"
            disabled={!assetTypeId}
          />
        </div>

        {!assetTypeId && (
          <p className="text-sm text-amber-600 mt-2">Please select Asset Type first to enable bulk device selection.</p>
        )}

        {assetTypeId && selectedAssets.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedAssets.map((asset) => (
              <div
                key={asset.id}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <span>{asset.assetId}</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = selectedAssets.filter(a => a.id !== asset.id);
                    onChange(updated);
                  }}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  title="Remove asset"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : assetTypeId ? (
          <p className="text-sm text-gray-500 mt-2">No assets selected. Click "Select Bulk Devices" to choose assets.</p>
        ) : null}
      </div>

      {/* Modal for Bulk Selection */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Select Assets for Bulk Allocation"
        size="xlarge"
      >
        <div className="space-y-4">
          {/* Selected Chips Display */}
          {checkedAssets.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-blue-900 mb-2">
                Selected Assets ({checkedAssets.size})
              </h5>
              <div className="flex flex-wrap gap-2">
                {Array.from(checkedAssets).map((assetId) => {
                  const asset = availableAssets.find(a => a.id === assetId);
                  return (
                    <div
                      key={assetId}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      <span>{asset?.assetId || assetId}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChip(assetId)}
                        className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                        title="Remove asset"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading assets...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load assets. Please try again.</p>
            </div>
          )}

          {/* TableWrapper with Search */}
          {!isLoading && !isError && (
            <TableWrapper
              key={checkedAssets.size}
              data={filteredAssets}
              columns={columns}
              renderCell={renderCell}
              showPagination={false}
              ariaLabel="Asset selection table"
              onRowClick={handleCheckboxChange}
              searchComponent={
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by Asset Tag, Brand, Model, or Condition..."
                />
              }
              classNames={{
                tr: "hover:bg-blue-50 cursor-pointer"
              }}
            />
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
          <CustomButton
            text="Cancel"
            onClick={() => setIsModalOpen(false)}
            variant="secondary"
            type="button"
          />
          <CustomButton
            text={`Add Selected Assets (${checkedAssets.size})`}
            onClick={handleSaveSelection}
            variant="primary"
            type="button"
            disabled={checkedAssets.size === 0}
          />
        </div>
      </Modal>
    </div>
  );
}
