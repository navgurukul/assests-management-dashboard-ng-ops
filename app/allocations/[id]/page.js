'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import AllocationDetails from '@/features/allocations/AllocationDetails';

export default function AllocationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const allocationId = params.id;

  const handleBack = () => {
    router.push('/allocations');
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <AllocationDetails allocationId={allocationId} onBack={handleBack} />
    </div>
  );
}

