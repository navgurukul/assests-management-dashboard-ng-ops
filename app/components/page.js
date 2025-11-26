'use client';

import React from 'react';
import { Trash2, Download, FileText } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import { componentsPageData } from '@/dummyJson/dummyJson';

const columns = [
  { key: "componentTag", label: "COMPONENT TAG" },
  { key: "type", label: "TYPE" },
  { key: "status", label: "STATUS" },
  { key: "installedOn", label: "INSTALLED ON" },
  { key: "action", label: "ACTION" },
];

export default function ComponentsPage() {
  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "componentTag":
        return <span className="font-medium text-gray-800">{cellValue}</span>;
      case "status":
        const statusColors = {
          'Working': 'bg-green-100 text-green-800',
          'In Stock': 'bg-blue-100 text-blue-800',
          'Scrap': 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      case "action":
        const actionIcons = {
          'Remove': <Trash2 className="w-4 h-4" />,
          'Install': <Download className="w-4 h-4" />,
          'Details': <FileText className="w-4 h-4" />,
        };
        const actionColors = {
          'Remove': 'text-red-600 hover:text-red-800',
          'Install': 'text-green-600 hover:text-green-800',
          'Details': 'text-gray-600 hover:text-gray-800',
        };
        return (
          <button className={`flex items-center gap-1 font-medium ${actionColors[cellValue] || 'text-blue-600 hover:text-blue-800'}`}>
            {actionIcons[cellValue]}
            <span>{cellValue}</span>
          </button>
        );
      case "installedOn":
        return <span className="text-gray-600">{cellValue}</span>;
      default:
        return cellValue;
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <TableWrapper
        data={componentsPageData}
        columns={columns}
        title="Components"
        renderCell={renderCell}
        itemsPerPage={10}
        showPagination={true}
        ariaLabel="Components table"
      />
    </div>
  );
}
