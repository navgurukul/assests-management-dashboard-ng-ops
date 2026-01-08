'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import CustomButton from '@/components/atoms/CustomButton';

export default function FilterDropdown({ 
  onFilterChange, 
  campusOptions = [],
  statusOptions = [],
  assetTypeOptions = [],
  selectedFilters = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setHoveredItem(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterOptions = [
    { 
      key: 'campus', 
      label: 'Campus',
      items: campusOptions
    },
    { 
      key: 'status', 
      label: 'Status',
      items: statusOptions
    },
    { 
      key: 'type', 
      label: 'Asset Type',
      items: assetTypeOptions
    },
  ];

  const handleFilterSelect = (filterKey, value) => {
    const newFilters = { ...selectedFilters };
    
    if (newFilters[filterKey] === value) {
      // If already selected, remove it
      delete newFilters[filterKey];
    } else {
      // Add or update filter
      newFilters[filterKey] = value;
    }
    
    onFilterChange(newFilters);
  };

  const activeFilterCount = Object.keys(selectedFilters).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <CustomButton
        text={`Filter${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
        icon={Filter}
        onClick={() => setIsOpen(!isOpen)}
        variant={activeFilterCount > 0 ? "primary" : "secondary"}
        size="md"
      />

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            {filterOptions.map((filter) => (
              <div
                key={filter.key}
                className="relative"
                onMouseEnter={() => setHoveredItem(filter.key)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {filter.label}
                  </span>
                  {selectedFilters[filter.key] && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Nested dropdown */}
                {hoveredItem === filter.key && filter.items.length > 0 && (
                  <div className="absolute right-full top-0 mr-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2 max-h-64 overflow-y-auto">
                      {filter.items.map((item) => (
                        <div
                          key={item.value}
                          onClick={() => handleFilterSelect(filter.key, item.value)}
                          className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
                            selectedFilters[filter.key] === item.value ? 'bg-blue-50' : ''
                          }`}
                        >
                          <span className="text-sm text-gray-700">{item.label}</span>
                          {selectedFilters[filter.key] === item.value && (
                            <svg
                              className="w-4 h-4 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
