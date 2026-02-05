'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ConsignmentDetails from '@/features/consignments/ConsignmentDetails';

export default function ConsignmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const consignmentId = params.id;
  const [consignmentData, setConsignmentData] = useState(null);

  useEffect(() => {
    // Get consignment data from sessionStorage
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('currentConsignmentData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setConsignmentData(parsedData);
          // Clean up sessionStorage after retrieving data
          sessionStorage.removeItem('currentConsignmentData');
        } catch (error) {
          console.error('Error parsing consignment data:', error);
        }
      }
    }
  }, []);

  return (
    <ConsignmentDetails 
      consignmentId={consignmentId}
      consignmentData={consignmentData}
      onBack={() => router.back()} 
    />
  );
}
