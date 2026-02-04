'use client';

import React, { useState } from 'react';
import { Filter, Calendar, Download, X } from 'lucide-react';
import FilterDropdown from './FilterDropdown';
import ActiveFiltersChips from './ActiveFiltersChips';
import CustomButton from '@/components/atoms/CustomButton';

export default function ReportWrapper({
  title,
  subtitle,
  children,
  campusOptions = [],
  statusOptions = [],
  assetTypeOptions = [],
  vendorOptions = [],
  donorOptions = [],
  onFilterChange,
  onDateRangeChange,
  onExportCSV,
  onExportPDF,
  showDateRange = true,
  showExport = true,
}) {
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleClearAllFilters = () => {
    setFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {showDateRange && (
              <div className="relative">
                <CustomButton
                  text="Date Range"
                  icon={Calendar}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  variant="secondary"
                  size="md"
                />

                {showDatePicker && (
                  <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10 w-80">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">Select Date Range</h3>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                        <input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => {
                            const newRange = { ...dateRange, from: e.target.value };
                            setDateRange(newRange);
                            if (onDateRangeChange) onDateRangeChange(newRange);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => {
                            const newRange = { ...dateRange, to: e.target.value };
                            setDateRange(newRange);
                            if (onDateRangeChange) onDateRangeChange(newRange);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showExport && (
              <>
                <CustomButton
                  text="Export CSV"
                  icon={Download}
                  onClick={onExportCSV}
                  variant="success"
                  size="md"
                />
                <CustomButton
                  text="Export PDF"
                  icon={Download}
                  onClick={onExportPDF}
                  variant="danger"
                  size="md"
                />
              </>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex items-center justify-between gap-3">
          <div>
            {hasActiveFilters && (
              <ActiveFiltersChips
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />
            )}
          </div>
          
          <FilterDropdown
            onFilterChange={handleFilterChange}
            campusOptions={campusOptions}
            statusOptions={statusOptions}
            assetTypeOptions={assetTypeOptions}
            selectedFilters={filters}
          />
        </div>
      </div>

      {/* Content Area */}
      <div>{children}</div>
    </div>
  );
}
