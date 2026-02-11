'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function MultiSelect({
  name,
  label,
  placeholder,
  options = [],
  value = [],
  onChange,
  onBlur,
  isInvalid,
  errorMessage,
  isRequired = false,
  isDisabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Ensure value is always an array
  const selectedValues = Array.isArray(value) ? value : [];

  // Get selected labels
  const selectedLabels = selectedValues
    .map(v => options.find(opt => opt.value === v)?.label)
    .filter(Boolean);

  // Handle option toggle
  const handleOptionToggle = (optionValue) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    
    onChange({ target: { name, value: newValues } });
  };

  // Handle remove tag
  const handleRemoveTag = (e, optionValue) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(v => v !== optionValue);
    onChange({ target: { name, value: newValues } });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Multi-Select Container */}
      <div
        ref={containerRef}
        className="relative"
        onBlur={onBlur}
      >
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between gap-2 ${
            isInvalid ? 'border-red-500' : 'border-gray-300'
          } ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1"
                >
                  {label}
                  <button
                    type="button"
                    onClick={(e) =>
                      handleRemoveTag(e, selectedValues[index])
                    }
                    className="hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500">{placeholder || 'Select options'}</span>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && !isDisabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="max-h-64 overflow-y-auto">
              {options.length > 0 ? (
                options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleOptionToggle(option.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-900">
                      {option.label}
                    </span>
                  </label>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options available
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {isInvalid && errorMessage && (
        <div className="text-red-500 text-xs mt-0.5">{errorMessage}</div>
      )}
    </div>
  );
}
