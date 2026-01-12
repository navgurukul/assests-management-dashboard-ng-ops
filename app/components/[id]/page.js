'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ComponentDetails from '@/features/components/ComponentDetails';

export default function ComponentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const componentId = params.id;
  const [componentData, setComponentData] = useState(null);

  useEffect(() => {
    // Get component data from sessionStorage
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('currentComponentData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setComponentData(parsedData);
          // Clean up sessionStorage after retrieving data
          sessionStorage.removeItem('currentComponentData');
        } catch (error) {
          console.error('Error parsing component data:', error);
        }
      }
    }
  }, []);

  return (
    <ComponentDetails 
      componentId={componentId}
      componentData={componentData}
      onBack={() => router.back()} 
    />
  );
}
