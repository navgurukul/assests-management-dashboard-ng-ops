'use client';

import React from 'react';
import TableWrapper from '@/components/Table/TableWrapper';
import { consignmentsPageData } from '@/dummyJson/dummyJson';

const columns = [
  { key: "code", label: "CODE" },
  { key: "courier", label: "COURIER" },
  { key: "fromTo", label: "FROM -> TO" },
  { key: "status", label: "STATUS" },
];

export default function ConsignmentsPage() {
  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "code":
        return <span className="font-medium text-gray-800">{cellValue}</span>;
      case "status":
        const statusColors = {
          'IN TRANSIT': 'bg-blue-100 text-blue-800',
          'DELIVERED': 'bg-green-100 text-green-800',
        };
        return (
          <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      default:
        return cellValue;
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <TableWrapper
        data={consignmentsPageData}
        columns={columns}
        title="Consignments"
        renderCell={renderCell}
        itemsPerPage={10}
        showPagination={true}
        ariaLabel="Consignments table"
      />
    </div>
  );
}
