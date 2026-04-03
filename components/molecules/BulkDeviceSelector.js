'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Package, X } from 'lucide-react';
import CustomButton from '../atoms/CustomButton';
import Modal from './Modal';
import TableWrapper from '../Table/TableWrapper';
import SearchInput from './SearchInput';
import useFetch from '@/app/hooks/query/useFetch';
import FilterDropdown from './FilterDropdown';
import ActiveFiltersChips from './ActiveFiltersChips';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asset-dashboard.navgurukul.org/api';

export default function BulkDeviceSelector({ selectedAssets = [], onChange, assetTypeId = null, sourceCampusId = null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedAssets, setCheckedAssets] = useState(new Set(selectedAssets.map(a => a.id)));
  const [selectedAssetObjects, setSelectedAssetObjects] = useState(new Map(selectedAssets.map(a => [a.id, a])));
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({});

  const filterStatusOptions = [
    { value: 'IN_STOCK', label: 'In Stock' },
    { value: 'ALLOCATED', label: 'Allocated' },
    { value: 'REPAIR', label: 'Under Repair' },
    { value: 'SCRAP', label: 'Scrap' },
    { value: 'PARTED_OUT', label: 'Parted Out' },
  ];

  const filterConditionOptions = [
    { value: 'WORKING', label: 'Working' },
    { value: 'MINOR_ISSUES', label: 'Minor Issues' },
    { value: 'NOT_WORKING', label: 'Not Working' },
  ];

  const getCategoryName = (key) => {
    switch (key) {
      case 'status': return 'Status';
      case 'condition': return 'Condition';
      default: return key;
    }
  };

  const getFilterLabel = (key, value) => {
    if (key === 'status') {
      const option = filterStatusOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    if (key === 'condition') {
      const option = filterConditionOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    return value;
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 800);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build API URL
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearch) params.append('search', debouncedSearch);
    
    params.append('page', currentPage);
    params.append('limit', pageSize);
    params.append('isConsignmentCreated', 'false');
    
    if (assetTypeId) params.append('type', assetTypeId);
    if (sourceCampusId) params.append('campusId', sourceCampusId);
    
    if (filters.status) params.append('status', filters.status);
    if (filters.condition) params.append('condition', filters.condition);
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}/assets?${queryString}` : `${baseUrl}/assets`;
  }, [assetTypeId, sourceCampusId, currentPage, pageSize, filters, debouncedSearch]);
  
  // Fetch assets from API
  const { data, isLoading, isError } = useFetch({
    url: apiUrl,
    queryKey: ['assets-bulk', assetTypeId, sourceCampusId, currentPage, pageSize, filters, debouncedSearch],
    enabled: !!assetTypeId, // Only fetch when assetType is selected
  });

  // Extract assets from API response
  const availableAssets = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];
    return data.data
      .filter(asset => asset.isConsignmentCreated === false)
      .map(asset => ({
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
    setCheckedAssets((prevCheckedAssets) => {
      const newCheckedAssets = new Set(prevCheckedAssets);
      if (newCheckedAssets.has(asset.id)) {
        newCheckedAssets.delete(asset.id);
      } else {
        newCheckedAssets.add(asset.id);
      }
      return newCheckedAssets;
    });

    setSelectedAssetObjects((prevMap) => {
      const newMap = new Map(prevMap);
      if (newMap.has(asset.id)) {
        newMap.delete(asset.id);
      } else {
        newMap.set(asset.id, asset);
      }
      return newMap;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setCheckedAssets(new Set(filteredAssets.map(a => a.id)));
      setSelectedAssetObjects((prevMap) => {
        const newMap = new Map(prevMap);
        filteredAssets.forEach(a => newMap.set(a.id, a));
        return newMap;
      });
    } else {
      setCheckedAssets(new Set());
      setSelectedAssetObjects(new Map());
    }
  };

  const handleRemoveChip = (assetId) => {
    const newCheckedAssets = new Set(checkedAssets);
    newCheckedAssets.delete(assetId);
    setCheckedAssets(newCheckedAssets);

    setSelectedAssetObjects((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.delete(assetId);
      return newMap;
    });
  };

  const handleSaveSelection = () => {
    const selected = Array.from(selectedAssetObjects.values());
    onChange(selected);
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    // Initialize checked assets from current selection
    setCheckedAssets(new Set(selectedAssets.map(a => a.id)));
    setSelectedAssetObjects(new Map(selectedAssets.map(a => [a.id, a])));
    setSearchTerm('');
    setDebouncedSearch('');
    setCurrentPage(1);
    setFilters({});
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
          <p className="text-sm text-gray-500 mt-2">No assets selected. Click &quot;Select Bulk Devices&quot; to choose assets.</p>
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

          {/* TableWrapper with Search, Filters, and Pagination */}
          {!isLoading && !isError && (
            <TableWrapper
              data={filteredAssets}
              columns={columns}
              renderCell={renderCell}
              showPagination={true}
              serverPagination={true}
              paginationData={data?.pagination}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              ariaLabel="Asset selection table"
              onRowClick={handleCheckboxChange}
              searchComponent={
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by Asset Tag, Brand, Model, or Condition..."
                />
              }
              filterComponent={
                <FilterDropdown
                  onFilterChange={(newFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1);
                  }}
                  statusOptions={filterStatusOptions}
                  conditionOptions={filterConditionOptions}
                  selectedFilters={filters}
                />
              }
              activeFiltersComponent={
                <ActiveFiltersChips
                  filters={filters}
                  onRemoveFilter={(key) => {
                    const newFilters = { ...filters };
                    delete newFilters[key];
                    setFilters(newFilters);
                    setCurrentPage(1);
                  }}
                  getCategoryName={getCategoryName}
                  getFilterLabel={getFilterLabel}
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
