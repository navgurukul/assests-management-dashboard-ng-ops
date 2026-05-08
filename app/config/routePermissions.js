/**
 * Route Permissions Configuration
 *
 * Defines which roles are allowed to access which routes.
 * Add new routes here as the app grows.
 *
 * Roles in system:
 * ADMIN | EMPLOYEE | STUDENT | RESIDENTIAL_TEAM | IT_COORDINATOR | IT_LEAD | OPERATION
 */

// Role groups for easier maintenance
const ADMIN_ONLY = ['ADMIN'];
const IT_ROLES = ['ADMIN', 'IT_LEAD', 'IT_COORDINATOR', 'OPERATION', 'RESIDENTIAL_TEAM'];
const STUDENT_EMPLOYEE_ONLY = ['STUDENT', 'EMPLOYEE'];
const EMPLOYEE_ONLY = ['EMPLOYEE'];
const ALL_AUTHENTICATED = ['ADMIN', 'IT_LEAD', 'IT_COORDINATOR', 'OPERATION', 'RESIDENTIAL_TEAM', 'EMPLOYEE', 'STUDENT'];

/**
 * routePermissions: { [routePrefix]: allowedRoles[] }
 *
 * Middleware will check: does the user's role exist in allowedRoles?
 * If not → redirect to /unauthorized
 *
 *  Route prefixes are matched longest-first, so:
 * - '/tickets/[id]' matches '/tickets'
 * -  '/allocations/create' matches '/allocations'
 */
export const routePermissions = {
  
  // ─── Student / Employee only routes ───────────────────────────────────────
  '/myassets': STUDENT_EMPLOYEE_ONLY,
  '/ticketstatus': STUDENT_EMPLOYEE_ONLY,

  // ─── Employee only routes ─────────────────────────────────────────────────
  '/ticketforapproval': EMPLOYEE_ONLY,


  // ─── IT / Admin only routes ───────────────────────────────────────────────
  '/assets': IT_ROLES,
  '/components': IT_ROLES,
  '/allocations': IT_ROLES,
  '/consignments': IT_ROLES,
  '/userlist': IT_ROLES,
  '/tickets': IT_ROLES,
  '/dashboard': IT_ROLES,

  // ─── User profile: All authenticated users ────────────────────────────────
  '/userprofile': ALL_AUTHENTICATED,
};
