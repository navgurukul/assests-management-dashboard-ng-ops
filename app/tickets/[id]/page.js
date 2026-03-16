'use client';

import { useRouter, useParams } from 'next/navigation';
import TicketDetails from '@/features/tickets/TicketDetails';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data, isLoading, isError, error } = useFetch({
    url: config.endpoints.tickets.details(ticketId),
    queryKey: ['ticket-details', ticketId],
    enabled: Boolean(ticketId),
  });

  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useFetch({
    url: config.endpoints.tickets.history(ticketId),
    queryKey: ['ticket-history', ticketId],
    enabled: Boolean(ticketId),
  });

  const normalizedTicketData = data?.data?.ticket || data?.data || data?.ticket || data || null;
  const normalizedTicketHistory = Array.isArray(historyResponse?.data?.historyLogs)
    ? historyResponse.data.historyLogs
    : Array.isArray(historyResponse?.data)
      ? historyResponse.data
      : Array.isArray(historyResponse?.historyLogs)
        ? historyResponse.historyLogs
        : [];

  return (
    <TicketDetails 
      ticketId={ticketId}
      ticketData={normalizedTicketData}
      historyData={normalizedTicketHistory}
      historyLoading={isHistoryLoading}
      historyError={isHistoryError ? historyError : null}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onBack={() => router.back()} 
    />
  );
}
