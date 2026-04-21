'use client';

import { useRouter, useParams } from 'next/navigation';
import AssetDetails from '@/features/assets/AssetDetails';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';

export default function AssetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id;

  const { data, isLoading, isError, error, refetch } = useFetch({
    url: config.endpoints.assets.details(assetId),
    queryKey: ['asset', assetId],
    enabled: !!assetId,
  });

  return (
    <AssetDetails
      assetId={assetId}
      assetData={data?.data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onBack={() => router.back()}
      refetch={refetch}
    />
  );
}
