'use client';

import { useRouter, useParams } from 'next/navigation';
import ComponentDetails from '@/features/components/ComponentDetails';
import useFetch from '@/app/hooks/query/useFetch';
import StateHandler from '@/components/atoms/StateHandler';

export default function ComponentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const componentId = params.id;

  const { data, isLoading, isError, error, refetch } = useFetch({
    url: `/components/${componentId}`,
    queryKey: ['component-details', componentId],
  });

  if (isLoading || isError) {
    return (
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading component details..."
        errorMessage="Failed to load component details"
        className="h-full flex items-center justify-center p-6"
      />
    );
  }

  const componentData = data?.success && data?.data ? data.data : null;

  return (
    <ComponentDetails 
      componentId={componentId}
      componentData={componentData}
      onBack={() => router.push('/components')} 
      refetch={refetch}
    />
  );
}