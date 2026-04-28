'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import useFetch from '@/app/hooks/query/useFetch';
import UserDetails from '@/features/userlist/UserDetails';
import StateHandler from '@/components/atoms/StateHandler';

export default function UserDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const { data, isLoading, isError, error } = useFetch({
    url: `/users/${userId}/assets`,
    queryKey: ['userAssets', userId],
    enabled: !!userId,
  });

  const apiData = data?.data;

  if (!userId) {
    return <p>No user ID provided.</p>;
  }

  return (
    <div className="overflow-y-auto h-full">
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading user details..."
        errorMessage="Error loading user details"
      />
      {!isLoading && !isError && apiData && (
        <UserDetails
          userId={userId}
          userData={apiData.user}
          allocations={apiData.allocations}
          onBack={() => router.back()}
        />
      )}
    </div>
  );
}