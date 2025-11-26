'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import TicketDetails from '@/features/tickets/TicketDetails';

export default function TicketDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('id');

  return (
    <TicketDetails 
      ticketId={ticketId} 
      onBack={() => router.back()} 
    />
  );
}
