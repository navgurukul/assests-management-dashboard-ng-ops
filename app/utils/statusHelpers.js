/**
 * Status Chip Helper Utilities
 *
 * Centralised color-mapping and chip-styling utilities used by every
 * table / list / tab across the app.  All chips use `rounded-full` so
 * they render in capsule form.
 */

// ---------------------------------------------------------------------------
// Base chip class – capsule form, used everywhere
// ---------------------------------------------------------------------------
export const CHIP_CLASSES =
  'px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center';

// ---------------------------------------------------------------------------
// Internal normalizer: uppercase + collapse spaces/hyphens to underscore
// e.g.  "In Stock" → "IN_STOCK"   "in-progress" → "IN_PROGRESS"
// ---------------------------------------------------------------------------
const normalize = (value) =>
  value?.toString().toUpperCase().replace(/[\s-]+/g, '_') ?? '';

// ---------------------------------------------------------------------------
// Color maps (normalised keys)
// ---------------------------------------------------------------------------

/** Covers ticket, asset, allocation, component, consignment statuses */
const STATUS_COLOR_MAP = {
  // Ticket
  OPEN: 'bg-orange-100 text-orange-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  WAITING_FOR_APPROVAL: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  ESCALATED: 'bg-orange-100 text-orange-800',
  OVERDUE: 'bg-red-100 text-red-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',

  // Asset / allocation
  ACTIVE: 'bg-green-100 text-green-800',
  ALLOCATED: 'bg-green-100 text-green-800',
  IN_STOCK: 'bg-blue-100 text-blue-800',
  REPAIR: 'bg-red-100 text-red-800',
  UNDER_REPAIR: 'bg-red-100 text-red-800',
  SCRAP: 'bg-gray-100 text-gray-800',
  PARTED_OUT: 'bg-orange-100 text-orange-800',
  IN_REPAIR: 'bg-yellow-100 text-yellow-800',
  RETIRED: 'bg-gray-100 text-gray-800',
  AVAILABLE: 'bg-blue-100 text-blue-800',
  RETURNED: 'bg-gray-100 text-gray-800',
  NO_ALLOCATION: 'bg-yellow-100 text-yellow-800',

  // Component
  INSTALLED: 'bg-indigo-100 text-indigo-800',
  UNDER_TESTING: 'bg-yellow-100 text-yellow-800',
  FAULTY: 'bg-red-100 text-red-800',
  WORKING: 'bg-green-100 text-green-800',

  // Consignment
  DRAFT: 'bg-gray-100 text-gray-800',
  DISPATCHED: 'bg-amber-100 text-amber-800',
  DELIVERED: 'bg-green-100 text-green-800',
};

const PRIORITY_COLOR_MAP = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const CONDITION_COLOR_MAP = {
  NEW: 'bg-blue-100 text-blue-800',
  WORKING: 'bg-green-100 text-green-800',
  DAMAGED: 'bg-orange-100 text-orange-800',
  FAULTY: 'bg-red-100 text-red-800',
  NEEDS_REPAIR: 'bg-yellow-100 text-yellow-800',
  NOT_WORKING: 'bg-red-100 text-red-800',
  MINOR_ISSUES: 'bg-yellow-100 text-yellow-800',
};

const ALLOCATION_TYPE_COLOR_MAP = {
  CAMPUS: 'bg-purple-100 text-purple-800',
  USER: 'bg-blue-100 text-blue-800',
};

const ALLOCATION_REASON_COLOR_MAP = {
  JOINER: 'bg-blue-50 text-blue-700',
  REPAIR: 'bg-red-50 text-red-700',
  REPLACEMENT: 'bg-orange-50 text-orange-700',
  LOANER: 'bg-purple-50 text-purple-700',
};

const DEVICE_MODE_COLOR_MAP = {
  BULK: 'bg-indigo-50 text-indigo-700',
  MANUAL: 'bg-teal-50 text-teal-700',
};

// ---------------------------------------------------------------------------
// Generic resolver
// ---------------------------------------------------------------------------

/**
 * Returns Tailwind colour classes for a chip.
 *
 * @param {string} value    - The chip label (raw, any casing / spacing)
 * @param {Object} colorMap - Map of **normalised** keys → Tailwind classes
 * @returns {string} Tailwind bg + text classes
 */
export const getChipColor = (value, colorMap) => {
  if (!value) return 'bg-gray-100 text-gray-800';
  return colorMap[normalize(value)] || 'bg-gray-100 text-gray-800';
};

// ---------------------------------------------------------------------------
// Convenience wrappers (one per semantic domain)
// ---------------------------------------------------------------------------

export const getStatusChipColor = (value) => getChipColor(value, STATUS_COLOR_MAP);
export const getPriorityChipColor = (value) => getChipColor(value, PRIORITY_COLOR_MAP);
export const getConditionChipColor = (value) => getChipColor(value, CONDITION_COLOR_MAP);
export const getAllocationTypeChipColor = (value) => getChipColor(value, ALLOCATION_TYPE_COLOR_MAP);
export const getAllocationReasonChipColor = (value) => getChipColor(value, ALLOCATION_REASON_COLOR_MAP);
export const getDeviceModeChipColor = (value) => getChipColor(value, DEVICE_MODE_COLOR_MAP);
