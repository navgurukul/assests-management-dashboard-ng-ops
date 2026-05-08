'use client';


import { ArrowLeft } from 'lucide-react';

import { useRouter }  from 'next/navigation';

export default function UnauthorizedPage() {
 
   const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center space-y-6 px-4">
        {/* 403 Number */}
        <h1 className="text-[120px] font-bold leading-none text-red-200 select-none">
          403
        </h1>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            You don't have permission to access this page. Your role does not have the required access level.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button onClick={() => router.push('/ticketStatus')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
        {/* Additional Help Text */}
        <div className="pt-4 text-sm text-gray-500">
          <p>If you believe you should have access to this page, please contact your administrator.</p>
        </div>
      </div>
    </div>
  );
}
