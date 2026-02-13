'use client';

import React, { useState } from 'react';
import BulkDeviceSelector from './BulkDeviceSelector';
import { allocationFormFields } from '@/app/config/formConfigs/allocationFormConfig';

export default function CampusAssetTable({ assets = [], onChange }) {
  const [selectionMode, setSelectionMode] = useState('single'); // 'single' or 'bulk'
  const [singleAsset, setSingleAsset] = useState({ assetId: '', assetType: '' });

  // Get campus asset fields from config
  const campusAssetFields = allocationFormFields.filter(
    field => (field.name === 'assetType' || field.name === 'assetId') && 
            field.showIf?.field === 'allocationType'
  );

  return (
    <div className="space-y-4">
      {/* Selection Mode Toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Device Selection Mode</h4>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="selectionMode"
              value="single"
              checked={selectionMode === 'single'}
              onChange={(e) => setSelectionMode(e.target.value)}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Single Device</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="selectionMode"
              value="bulk"
              checked={selectionMode === 'bulk'}
              onChange={(e) => setSelectionMode(e.target.value)}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Bulk Device</span>
          </label>
        </div>
      </div>

      {/* Conditional Rendering based on Selection Mode */}
      {selectionMode === 'bulk' ? (
        <BulkDeviceSelector selectedAssets={assets} onChange={onChange} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* {campusAssetFields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} QQQQ {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type}
                id={field.name}
                value={singleAsset[field.name]}
                onChange={(e) => setSingleAsset({ ...singleAsset, [field.name]: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={field.placeholder}
              />
            </div>
          ))} */}
        </div>
      )}
    </div>
  );
}
