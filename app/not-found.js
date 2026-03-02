'use client';

import Link from 'next/link';

export default function NotFound() {
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
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
