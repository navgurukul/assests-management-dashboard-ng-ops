'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import '@/components/atoms/Loader.css';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  // Define public routes (no authentication required)
  const publicPaths = ['/login'];

  // Check if current path is public
  const isPublicPath = publicPaths.some((path) => pathname === path);

  useEffect(() => {
    // Wait for auth state to load
    if (loading) {
      return;
    }

    // Case 1: User is authenticated and trying to access login page
    // Redirect to dashboard
    if (isAuthenticated && isPublicPath) {
      router.replace('/dashboard');
      return;
    }

    // Case 2: User is NOT authenticated and trying to access protected page
    // Redirect to login
    if (!isAuthenticated && !isPublicPath) {
      // Store current path for redirect after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.replace('/login');
      return;
    }

    // Case 3: User is on correct page (authenticated on protected, or not authenticated on public)
    setIsReady(true);
  }, [isAuthenticated, loading, pathname, isPublicPath, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loader"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content while redirecting
  if (!isReady) {
    return null;
  }

  // PUBLIC LAYOUT: For login page (no sidebar, no header)
  if (isPublicPath && !isAuthenticated) {
    return <>{children}</>;
  }

  // PROTECTED LAYOUT: For authenticated users (with sidebar and header)
  if (!isPublicPath && isAuthenticated) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header - Full Width at Top */}
        <Header />

        {/* Sidebar and Main Content - Side by Side Below Header */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Fallback: show nothing if in inconsistent state
  return null;
}
