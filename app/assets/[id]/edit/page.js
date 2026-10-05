'use client';

import { useParams } from 'next/navigation';
import EditAsset from '@/features/assets/EditAsset';

export default function EditAssetPage() {
  const params = useParams();
  const assetId = params.id;

  return <EditAsset assetId={assetId} />;
}
