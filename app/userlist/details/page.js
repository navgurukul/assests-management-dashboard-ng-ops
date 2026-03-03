'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import UserDetails from '@/features/userlist/UserDetails';

export default function UserDetailsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('currentUserData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          sessionStorage.removeItem('currentUserData');
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  return (
    <div className="overflow-y-auto h-full">
      <UserDetails
        userId={userData?.id}
        userData={userData}
        onBack={() => router.back()}
      />
    </div>
  );
}
