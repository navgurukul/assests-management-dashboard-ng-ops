'use client';

import { Chrome } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Login to dashboard
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <button
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              router.push('/dashboard');
            }}
          >
            <Chrome className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-700">
              Log In with Google
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
