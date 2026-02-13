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

  // Dummy assets data
  const myAssets = [
    { id: 1, name: 'Laptop Dell XPS 15', serialNumber: 'DL12345', assignedDate: '2024-01-15', status: 'Active' },
    { id: 2, name: 'iPhone 14 Pro', serialNumber: 'IP67890', assignedDate: '2024-02-01', status: 'Active' },
    { id: 3, name: 'Monitor LG 27"', serialNumber: 'LG54321', assignedDate: '2024-01-20', status: 'Active' },
  ];

  return (
    <UserProfileDetails 
      userData={user}
      userAssets={myAssets}
    />
  );
}
