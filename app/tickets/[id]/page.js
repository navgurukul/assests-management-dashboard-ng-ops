'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import TicketDetails from '@/features/tickets/TicketDetails';

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id;
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    // Get ticket data from sessionStorage
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('currentTicketData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setTicketData(parsedData);
          // Clean up sessionStorage after retrieving data
          sessionStorage.removeItem('currentTicketData');
        } catch (error) {
          console.error('Error parsing ticket data:', error);
        }
      }
    }
  }, []);

  return (
    <TicketDetails 
      ticketId={ticketId}
      ticketData={ticketData}
      onBack={() => router.back()} 
    />
  );
}
