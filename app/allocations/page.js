'use client';

import React from 'react';
import AllocationsList from '@/features/allocations/AllocationsList';

export default function AllocationsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AllocationsList />
    </div>
  );
}

