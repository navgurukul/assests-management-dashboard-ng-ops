'use client';

import { useRouter, useParams } from 'next/navigation';
import ReturnDetails from '@/features/consignments/ReturnDetails';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';

export default function ReturnDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const returnId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const handleBack = () => {
    router.push('/consignments?view=in-transit');
  };

  // Fetch return details from API
  const { data, isLoading, isError, error } = useFetch({
    url: config.endpoints.consignmentReturnAssets.details(returnId),
    queryKey: ['return-details', returnId],
    enabled: Boolean(returnId),
  });

  const normalizedReturnData = data?.data || data?.return || data || null;

  return (
    <ReturnDetails
      returnId={returnId}
      returnData={normalizedReturnData}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onBack={handleBack}
    />
  );
}