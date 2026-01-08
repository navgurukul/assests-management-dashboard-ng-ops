'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

/**
 * HOC to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        // Store current path to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.push('/login');
      }
    }, [isAuthenticated, loading, pathname, router]);

    // Show loading state while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Don't render anything if not authenticated (will redirect)
    if (!isAuthenticated) {
      return null;
    }

    // Render the protected component
    return <Component {...props} />;
  };
}

/**
 * Component wrapper for protecting routes
 * Can be used to wrap page content directly
 */
export function ProtectedRoute({ children, requiredRoles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Store current path to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Check if user has required role
  useEffect(() => {
    if (!loading && isAuthenticated && requiredRoles.length > 0) {
      const userRoles = user?.rolesList || [];
      const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        // Redirect to unauthorized page or dashboard
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, user, requiredRoles, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check role access
  if (requiredRoles.length > 0) {
    const userRoles = user?.rolesList || [];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has specific role
 */
export function useRequireRole(requiredRoles = []) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return false;
  }

  if (requiredRoles.length === 0) {
    return true;
  }

  const userRoles = user.rolesList || [];
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Hook to redirect if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  return { isAuthenticated, loading };
}
