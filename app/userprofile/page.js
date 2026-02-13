'use client';

import { UserProfileDetails } from '@/features/userprofile';

export default function ProfilePage() {
  // Test user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Administrator',
    department: 'IT Operations',
    location: 'New York, USA',
    joinDate: 'January 15, 2024',
    avatar: null,
  };

  return (
    <UserProfileDetails 
      userData={user}
    />
  );
}
