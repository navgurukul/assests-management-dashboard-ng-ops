'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Columns3, Check, X, RotateCcw, Eye, EyeOff } from 'lucide-react';
import CustomButton from '@/components/atoms/CustomButton';

export default function ColumnSelector({
  allColumns,
  visibleColumnKeys,
  alwaysVisibleColumns = [],
  onToggleColumn,
  onShowAll,
  onResetToDefault,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (columnKey) => {
    // Don't allow toggling if it's an always visible column
    if (alwaysVisibleColumns.includes(columnKey)) {
      return;
    }
    onToggleColumn(columnKey);
  };

  const isColumnChecked = (columnKey) => {
    return visibleColumnKeys.includes(columnKey);
  };

  const isColumnDisabled = (columnKey) => {
    return alwaysVisibleColumns.includes(columnKey);
  };

  const visibleCount = visibleColumnKeys.length;
  const totalCount = allColumns.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <CustomButton
        text={`Column (${visibleCount}/${totalCount})`}
        icon={Columns3}
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        size="md"
      />

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Manage Columns</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
            <button
              onClick={() => {
                onShowAll();
              }}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Eye size={14} />
              Show All
            </button>
            <button
              onClick={() => {
                onResetToDefault();
              }}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 font-medium"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          {/* Column List */}
          <div className="max-h-96 overflow-y-auto">
            {allColumns.map((column) => {
              const isChecked = isColumnChecked(column.key);
              const isDisabled = isColumnDisabled(column.key);

              return (
                <label
                  key={column.key}
                  className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => handleToggle(column.key)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {isChecked && (
                      <Check
                        size={12}
                        className="absolute left-0.5 text-white pointer-events-none"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">{column.label}</span>
                    {isDisabled && (
                      <span className="ml-2 text-xs text-gray-500">(Required)</span>
                    )}
                  </div>
                  {isChecked ? (
                    <Eye size={14} className="text-green-500" />
                  ) : (
                    <EyeOff size={14} className="text-gray-400" />
                  )}
                </label>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {visibleCount} of {totalCount} columns visible
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
