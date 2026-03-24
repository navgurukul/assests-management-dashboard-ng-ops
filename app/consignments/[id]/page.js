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

  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useFetch({
    url: config.endpoints.consignments.history(consignmentId),
    queryKey: ['consignment-history', consignmentId],
    enabled: Boolean(consignmentId),
  });

  const normalizedConsignmentData = data?.data || data?.consignment || data || null;
  const normalizedConsignmentHistory = Array.isArray(historyResponse?.data?.historyLogs)
    ? historyResponse.data.historyLogs
    : Array.isArray(historyResponse?.data)
      ? historyResponse.data
      : Array.isArray(historyResponse?.historyLogs)
        ? historyResponse.historyLogs
        : [];

  return (
    <ConsignmentDetails 
      consignmentId={consignmentId}
      consignmentData={normalizedConsignmentData}
      historyData={normalizedConsignmentHistory}
      historyLoading={isHistoryLoading}
      historyError={isHistoryError ? historyError : null}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onBack={() => router.back()} 
    />
  );
}
