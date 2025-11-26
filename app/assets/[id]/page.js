'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import AssetDetails from '@/features/assets/AssetDetails';

export default function AssetDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');

  return (
    <AssetDetails 
      assetId={assetId} 
      onBack={() => router.back()} 
    />
  );
}
