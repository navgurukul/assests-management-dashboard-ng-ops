import { NextResponse } from 'next/server';
import { getRoutePermissions } from '@/app/config/routePermissions';

// Routes that never require authentication
const PUBLIC_ROUTES = ['/login', '/unauthorized'];

// Root route — has its own redirect logic in the page
const ROOT_ROUTE = '/';

/**
 * Lightweight JWT decoder for Edge Runtime.
 * Does NOT verify signature — that's fine here because:
 *   1. We only use the role for UI routing, not for data access.
 *   2. Real authorization happens on the API/backend.
 *   3. Tampering with the token would just land them on /unauthorized
 *      or break their session entirely.
 */
function decodeJwtPayload(token) {
  try {
    const base64Payload = token.split('.')[1];
    // Edge Runtime supports atob
    const jsonPayload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Find the matching permission entry for a given pathname.
 * Checks route prefixes from longest to shortest for specificity.
 * Routes with exactOnly only match the exact path, not nested routes.
 */
function getAllowedRoles(pathname) {
  const routePermissions = getRoutePermissions();
  const routes = Object.keys(routePermissions).sort((a, b) => b.length - a.length);
  const match = routes.find((route) => {
    const config = routePermissions[route];
    if (config.exactOnly) {
      return pathname === route;
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
  return match ? routePermissions[match].allowedRoles : null;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Always allow public routes
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  if (isPublicRoute || pathname === ROOT_ROUTE) {
    return NextResponse.next();
  }

  // 2. Get token from cookie (set by AuthContext on login)
  const authCookie = request.cookies.get('__AUTH__');
  const token = authCookie?.value;

  // 3. No token → redirect to login, save intended destination
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Decode token to extract role
  const payload = decodeJwtPayload(token);
  const userRole = payload?.role;

  // 5. If token is malformed / no role → treat as unauthenticated
  if (!userRole) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Check route-level permissions
  const allowedRoles = getAllowedRoles(pathname);

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // User is authenticated but does NOT have permission for this route
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // 7. Authenticated + authorized → allow
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
