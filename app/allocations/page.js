'use client';

import React from 'react';
import AllocationsList from '@/features/allocations/AllocationsList';

export default function AllocationsPage() {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <AllocationsList />
    </div>
  );
}

