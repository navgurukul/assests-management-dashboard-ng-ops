'use client';

/**
 * CreateConsignment Component
 * 
 * This component is intentionally left as a placeholder.
 * The actual consignment creation is handled via a modal in the ConsignmentsList component.
 * This file exists to maintain the route structure (/consignments/create).
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateConsignment() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the consignments list page
    // The creation modal will be triggered from there
    router.push('/consignments');
  }, [router]);

  // Show a simple loading state while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
