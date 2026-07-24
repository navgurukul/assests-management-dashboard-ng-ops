/**
 * Route & Role Configuration — SINGLE SOURCE OF TRUTH
 *
 * Roles in system:
 * ADMIN | IT_COORDINATOR | IT_LEAD | OPERATION | RESIDENTIAL_TEAM | STUDENT | MANAGER | EMPLOYEE
 *
 * How it works:
 * - Each menu item has `allowedRoles` — defines who can see it in sidebar
 *   AND who can access its route + all nested routes.
 * - Middleware derives route permissions from this config automatically.
 * - Adding a new sidebar item = route protection is handled automatically.
 */

// Role groups for easier maintenance
export const IT_ROLES = ['ADMIN', 'IT_LEAD', 'IT_COORDINATOR', 'OPERATION', 'RESIDENTIAL_TEAM'];
export const END_USER_ROLES = ['STUDENT', 'MANAGER', 'EMPLOYEE'];
export const ALL_AUTHENTICATED = [...IT_ROLES, ...END_USER_ROLES];

/**
 * menuItems — drives both sidebar rendering AND route protection.
 * If a path is listed here with allowedRoles, all nested routes under it are also protected.
 * e.g. '/assets' protects '/assets', '/assets/create', '/assets/[id]', etc.
 */
export const menuItems = [
  { name: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', allowedRoles: IT_ROLES },
  { name: 'Tickets', icon: 'Ticket', path: '/tickets', allowedRoles: IT_ROLES },
  { name: 'Allocations', icon: 'Share2', path: '/allocations', allowedRoles: IT_ROLES },
  { name: 'Consignments', icon: 'Archive', path: '/consignments', allowedRoles: IT_ROLES },
  { name: 'Assets', icon: 'Package', path: '/assets', allowedRoles: IT_ROLES },
  { name: 'Components', icon: 'Component', path: '/components', allowedRoles: IT_ROLES },
  { name: 'User List', icon: 'Users', path: '/userlist', allowedRoles: IT_ROLES },
  { name: 'My Assets', icon: 'Package', path: '/myassets', allowedRoles: END_USER_ROLES },
  { name: 'My Ticket Status', icon: 'Ticket', path: '/ticketstatus', allowedRoles: END_USER_ROLES },
  { name: 'Ticket for Approval', icon: 'TicketCheck', path: '/ticketforapproval', allowedRoles: ['MANAGER'] },
];

/**
 * Additional routes not in sidebar but still need protection.
 * e.g. /userprofile is shown separately at bottom of sidebar.
 * More specific paths (like /tickets/create) override parent path rules
 * because middleware matches longest prefix first.
 */
export const additionalRoutePermissions = [
  { path: '/userprofile', allowedRoles: ALL_AUTHENTICATED },
  { path: '/tickets/create', allowedRoles: ALL_AUTHENTICATED },
  { path: '/tickets/[id]', allowedRoles: ALL_AUTHENTICATED },
];

/**
 * Builds the route permissions map from menuItems + additionalRoutePermissions.
 * Used by middleware for prefix-based route matching.
 * Routes with exactOnly: true only protect the exact path, not nested routes.
 */
export function getRoutePermissions() {
  const allRoutes = [...menuItems, ...additionalRoutePermissions];
  const permissionsMap = {};
  for (const item of allRoutes) {
    permissionsMap[item.path] = {
      allowedRoles: item.allowedRoles,
      exactOnly: item.exactOnly || false,
    };
  }
  return permissionsMap;
}