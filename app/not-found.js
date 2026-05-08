'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter }  from 'next/navigation';

export default function NotFound() {
     const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full bg-gray-50">
      <div className="text-center space-y-6">
        {/* 404 Number */}
        <h1 className="text-[120px] font-bold leading-none text-gray-200 select-none">
          404
        </h1>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Button */}
        <button onClick={() => router.push('/ticketStatus')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
      </div>
    </div>
  );
}
