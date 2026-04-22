'use client';

import { useRouter, useParams } from 'next/navigation';
import { useMemo } from 'react';
import ReturnDetails from '@/features/consignments/ReturnDetails';

export default function ReturnDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const returnId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const returnData = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('currentReturnData');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.id === returnId) return parsed;
      return null;
    } catch {
      return null;
    }
  }, [returnId]);

  return (
    <ReturnDetails
      returnData={returnData}
      isLoading={false}
      isError={!returnData}
      error={!returnData ? { message: 'Return data not found. Please go back and try again.' } : null}
      onBack={() => router.back()}
    />
  );
}