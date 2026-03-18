'use client';

import React from 'react';
import AllocationsList from '@/features/allocations/AllocationsList';

export default function AllocationsPage() {
  return (
    <div className="overflow-y-auto h-full">
      <AllocationsList />
    </div>
  );
}

