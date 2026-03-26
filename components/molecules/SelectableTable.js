"use client";

import React from 'react';
import CustomButton from '@/components/atoms/CustomButton';
export default function SelectableTable({
  label = 'Select',
  columns = [],
  rows = [],
  rowKey = 'id',
  selectedRow = null,
  onSelectRow,
  getSelectedLabel,
  isLoading = false,
  emptyMessage = 'No data available.',
  showTable,
  onToggleTable,
}) {
  const isSelected = (row) => selectedRow?.[rowKey] === row[rowKey];

  const handleRowClick = (row) => {
    onSelectRow?.(isSelected(row) ? null : row);
  };

  const displayLabel = selectedRow
    ? (getSelectedLabel ? getSelectedLabel(selectedRow) : String(selectedRow[rowKey]))
    : null;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <CustomButton
          text={showTable ? 'Hide' : 'Select'}
          variant={showTable ? 'secondary' : 'primary'}
          size="sm"
          onClick={onToggleTable}
        />
      </div>

      {displayLabel && (
        <p className="text-xs text-blue-700 mb-2">
          Selected: <span className="font-medium">{displayLabel}</span>
        </p>
      )}

      {showTable && (
        isLoading ? (
          <div className="text-sm text-gray-500 py-2">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">{emptyMessage}</div>
        ) : (
          <div className="overflow-auto max-h-52 border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 w-10" />
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-2 text-left font-medium text-gray-600 ${col.className || ''}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row[rowKey]}
                    onClick={() => handleRowClick(row)}
                    className={`cursor-pointer border-t border-gray-100 transition-colors hover:bg-blue-50 ${
                      isSelected(row) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected(row)}
                        onChange={() => handleRowClick(row)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 accent-blue-600"
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-3 py-2 ${col.cellClassName || 'text-gray-600'}`}
                      >
                        {col.render ? col.render(row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
