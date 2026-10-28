'use client';

import LeaseExtensionsList from '@/features/leaseExtensions/LeaseExtensionsList';

export default function LeaseRequestsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <LeaseExtensionsList />
    </div>
  );
}
