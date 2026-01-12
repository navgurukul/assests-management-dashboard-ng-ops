import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login'];

// Define the root route
const rootRoute = '/';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current route is root
  const isRootRoute = pathname === rootRoute;
  
  // Get the auth token from cookies or headers
  const authCookie = request.cookies.get('__AUTH__');
  const authToken = authCookie?.value;
  
  // Allow root route (it will handle its own redirect)
  if (isRootRoute) {
    return NextResponse.next();
  }
  
  // If the route is public, allow access
  if (isPublicRoute) {
    // Allow login page access - let the page handle authenticated user redirects
    return NextResponse.next();
  }
  
  // For protected routes, check if user is authenticated
  if (!authToken) {
    // Store the original URL to redirect back after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // User is authenticated, allow access to protected routes
  return NextResponse.next();
}

// Configure which routes should be processed by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (if you want to handle them separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
