'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import AssetDetails from '@/features/assets/AssetDetails';

export default function AssetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id;
  const [assetData, setAssetData] = useState(null);

  useEffect(() => {
    // Get asset data from sessionStorage
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('currentAssetData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setAssetData(parsedData);
          // Clean up sessionStorage after retrieving data
          sessionStorage.removeItem('currentAssetData');
        } catch (error) {
          console.error('Error parsing asset data:', error);
        }
      }
    }
  }, []);

  return (
    <AssetDetails 
      assetId={assetId}
      assetData={assetData}
      onBack={() => router.back()} 
    />
  );
}
