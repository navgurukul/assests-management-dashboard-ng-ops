'use client';

import React from 'react';
import BulkDeviceSelector from './BulkDeviceSelector';

export default function CampusAssetTable({ assets = [], onChange }) {
  return (
    <div className="space-y-4">
      <BulkDeviceSelector selectedAssets={assets} onChange={onChange} />
    </div>
  );
}
