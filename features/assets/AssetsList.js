'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, UserPlus, FileText, X } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import AssetForm from '@/forms/form';
import { assetsListData } from '@/dummyJson/dummyJson';

const columns = [
  { key: "assetTag", label: "ASSET TAG" },
  { key: "type", label: "TYPE" },
  { key: "campus", label: "CAMPUS" },
  { key: "status", label: "STATUS" },
  { key: "location", label: "LOCATION" },
  { key: "actions", label: "ACTIONS" },
];

export default function AssetsList() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "assetTag":
        return <span className="font-medium text-gray-800">{cellValue}</span>;
      case "status":
        const statusColors = {
          'Repair': 'bg-red-100 text-red-800',
          'Allocated': 'bg-green-100 text-green-800',
          'In Stock': 'bg-blue-100 text-blue-800',
          'Scrap': 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      case "actions":
        const actionIcons = {
          'View': <Eye className="w-4 h-4" />,
          'Assign': <UserPlus className="w-4 h-4" />,
          'Details': <FileText className="w-4 h-4" />,
        };
        const actionColors = {
          'View': 'text-blue-600 hover:text-blue-800',
          'Assign': 'text-green-600 hover:text-green-800',
          'Details': 'text-gray-600 hover:text-gray-800',
        };
        return (
          <button className={`flex items-center gap-1 font-medium ${actionColors[cellValue] || 'text-blue-600 hover:text-blue-800'}`}>
            {actionIcons[cellValue]}
            <span>{cellValue}</span>
          </button>
        );
      default:
        return cellValue;
    }
  };

  const handleRowClick = (asset) => {
    router.push(`/assets/${asset.id}?id=${asset.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search Assets" 
              className="outline-none text-sm flex-1"
            />
          </div>

          {/* Campus Filter */}
          <select className="border border-gray-300 rounded px-3 py-2 text-sm outline-none">
            <option>Campus ▼</option>
            <option>Sarjapura</option>
            <option>Pune</option>
            <option>Himachal</option>
            <option>Dantewada</option>
          </select>

          {/* Type Filter */}
          <select className="border border-gray-300 rounded px-3 py-2 text-sm outline-none">
            <option>Type ▼</option>
            <option>Laptop</option>
            <option>Desktop</option>
            <option>Tablet</option>
          </select>

          {/* Status Filter */}
          <select className="border border-gray-300 rounded px-3 py-2 text-sm outline-none">
            <option>Status ▼</option>
            <option>Repair</option>
            <option>Allocated</option>
            <option>In Stock</option>
            <option>Scrap</option>
          </select>

          {/* Export Button */}
          <button className="border border-gray-300 rounded px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="border border-gray-300 rounded px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Add Asset
          </button>

        </div>
      </div>

      {/* Table */}
      <TableWrapper
        data={assetsListData}
        columns={columns}
        title=""
        renderCell={renderCell}
        itemsPerPage={10}
        showPagination={true}
        ariaLabel="Assets table"
        onRowClick={handleRowClick}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Add New Asset</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Form */}
            <AssetForm />

            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              {/* <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
