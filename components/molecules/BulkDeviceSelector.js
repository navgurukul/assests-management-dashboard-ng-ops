'use client';

import React, { useState, useMemo } from 'react';
import { Package, X } from 'lucide-react';
import CustomButton from '../atoms/CustomButton';
import Modal from './Modal';
import TableWrapper from '../Table/TableWrapper';
import SearchInput from './SearchInput';

export default function BulkDeviceSelector({ selectedAssets = [], onChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedAssets, setCheckedAssets] = useState(new Set(selectedAssets.map(a => a.assetId)));
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  const availableAssets = [
    { id: 'LAP001', assetId: 'LAP001', assetType: 'Laptop', workingCondition: 'EXCELLENT' },
    { id: 'LAP002', assetId: 'LAP002', assetType: 'Laptop', workingCondition: 'GOOD' },
    { id: 'LAP003', assetId: 'LAP003', assetType: 'Laptop', workingCondition: 'FAIR' },
    { id: 'LAP004', assetId: 'LAP004', assetType: 'Laptop', workingCondition: 'EXCELLENT' },
    { id: 'LAP005', assetId: 'LAP005', assetType: 'Laptop', workingCondition: 'GOOD' },
    { id: 'LAP006', assetId: 'LAP006', assetType: 'Laptop', workingCondition: 'POOR' },
    { id: 'LAP007', assetId: 'LAP007', assetType: 'Laptop', workingCondition: 'EXCELLENT' },
    { id: 'LAP008', assetId: 'LAP008', assetType: 'Laptop', workingCondition: 'NEEDS_REPAIR' },
  ];

  // Filter assets based on search term
  const filteredAssets = useMemo(() => {
    if (!searchTerm) return availableAssets;
    const lowerSearch = searchTerm.toLowerCase();
    return availableAssets.filter(asset => 
      asset.assetId.toLowerCase().includes(lowerSearch) ||
      asset.assetType.toLowerCase().includes(lowerSearch) ||
      asset.workingCondition.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, availableAssets]);

  const handleCheckboxChange = (asset) => {
    const newCheckedAssets = new Set(checkedAssets);
    if (newCheckedAssets.has(asset.assetId)) {
      newCheckedAssets.delete(asset.assetId);
    } else {
      newCheckedAssets.add(asset.assetId);
    }
    setCheckedAssets(newCheckedAssets);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setCheckedAssets(new Set(filteredAssets.map(a => a.assetId)));
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
    const selected = availableAssets.filter(asset => checkedAssets.has(asset.assetId));
    onChange(selected);
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    // Initialize checked assets from current selection
    setCheckedAssets(new Set(selectedAssets.map(a => a.assetId)));
    setSearchTerm('');
    setIsModalOpen(true);
  };

  const getConditionBadge = (condition) => {
    const badges = {
      EXCELLENT: 'bg-green-100 text-green-800',
      GOOD: 'bg-blue-100 text-blue-800',
      FAIR: 'bg-yellow-100 text-yellow-800',
      POOR: 'bg-orange-100 text-orange-800',
      NEEDS_REPAIR: 'bg-red-100 text-red-800',
    };
    return badges[condition] || 'bg-gray-100 text-gray-800';
  };

  const getConditionLabel = (condition) => {
    return condition.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  // Table columns configuration
  const columns = [
    { key: 'select', label: '', className: 'w-12' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetType', label: 'Asset Type' },
    { key: 'workingCondition', label: 'Working Condition' },
  ];

  // Custom render for table cells
  const renderCell = (asset, columnKey) => {
    switch (columnKey) {
      case 'select':
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={checkedAssets.has(asset.assetId)}
              onChange={() => handleCheckboxChange(asset)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        );
      case 'assetId':
        return <span className="font-medium text-gray-900">{asset.assetId}</span>;
      case 'assetType':
        return <span className="text-gray-700">{asset.assetType}</span>;
      case 'workingCondition':
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getConditionBadge(asset.workingCondition)}`}>
            {getConditionLabel(asset.workingCondition)}
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
            size="sm"
            icon={Package}
          />
        </div>

        {selectedAssets.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedAssets.map((asset) => (
              <div
                key={asset.assetId}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <span>{asset.assetId}</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = selectedAssets.filter(a => a.assetId !== asset.assetId);
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
        ) : (
          <p className="text-sm text-gray-500 mt-2">No assets selected. Click "Select Bulk Devices" to choose assets.</p>
        )}
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
                {Array.from(checkedAssets).map((assetId) => (
                  <div
                    key={assetId}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <span>{assetId}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChip(assetId)}
                      className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                      title="Remove asset"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TableWrapper with Search */}
          <TableWrapper
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
                placeholder="Search by Asset ID, Type, or Condition..."
              />
            }
            classNames={{
              tr: "hover:bg-blue-50 cursor-pointer"
            }}
          />
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
