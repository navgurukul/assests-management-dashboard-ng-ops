'use client';

import { useRouter, useParams } from 'next/navigation';
import ConsignmentDetails from '@/features/consignments/ConsignmentDetails';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';

export default function ConsignmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const consignmentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data, isLoading, isError, error } = useFetch({
    url: config.endpoints.consignments.details(consignmentId),
    queryKey: ['consignment-details', consignmentId],
    enabled: Boolean(consignmentId),
  });

  const normalizedConsignmentData = data?.data || data?.consignment || data || null;

  return (
    <ConsignmentDetails 
      consignmentId={consignmentId}
      consignmentData={normalizedConsignmentData}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onBack={() => router.back()} 
    />
  );
}
