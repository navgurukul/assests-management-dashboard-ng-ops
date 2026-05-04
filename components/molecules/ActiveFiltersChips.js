'use client';

import React from 'react';
import { X } from 'lucide-react';

export default function ActiveFiltersChips({ 
  filters = {},
  onRemoveFilter,
  onClearAll,
  getCategoryName,
  getFilterLabel 
}) {
  if (Object.keys(filters).length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-600">Active Filters:</span>
        {Object.entries(filters).map(([key, value]) => (
          <div
            key={key}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
          >
            <span className="font-semibold">{getCategoryName(key)}:</span>
            <span>{getFilterLabel(key, value)}</span>
            <button
              onClick={() => onRemoveFilter(key)}
              className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${getCategoryName(key)} filter`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
         {onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium transition-colors border border-red-200"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
