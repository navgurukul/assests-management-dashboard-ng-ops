/**
 * SLA Helper Utilities
 * Functions to calculate SLA status and determine if tickets are overdue
 */

/**
 * Calculate if a ticket is overdue based on allocation date and expected resolution days
 * @param {string} allocationDate - ISO date string when ticket was allocated
 * @param {number} expectedResolutionDays - Expected days to resolve
 * @param {string} currentStatus - Current ticket status
 * @returns {Object} SLA status information
 */
export function calculateSLAStatus(allocationDate, expectedResolutionDays, currentStatus) {
  // Return default if no SLA set
  if (!allocationDate || !expectedResolutionDays) {
    return {
      isOverdue: false,
      daysElapsed: 0,
      daysRemaining: null,
      status: 'not-set',
    };
  }

  const allocation = new Date(allocationDate);
  const now = new Date();
  
  // Calculate elapsed days
  const daysElapsed = Math.floor((now - allocation) / (1000 * 60 * 60 * 24));
  const daysRemaining = Number(expectedResolutionDays) - daysElapsed;
  
  // Check if already closed/resolved
  const isCompleted = ['CLOSED', 'RESOLVED'].includes(currentStatus?.toUpperCase());
  
  if (isCompleted) {
    return {
      isOverdue: daysElapsed > expectedResolutionDays,
      daysElapsed,
      daysRemaining: 0,
      status: 'completed',
      resolvedOnTime: daysElapsed <= expectedResolutionDays,
    };
  }

  // Determine current SLA status
  const isOverdue = daysRemaining < 0;
  const isDueSoon = daysRemaining >= 0 && daysRemaining <= 2;
  const isOnTrack = daysRemaining > 2;

  return {
    isOverdue,
    daysElapsed,
    daysRemaining,
    status: isOverdue ? 'overdue' : isDueSoon ? 'warning' : 'on-track',
  };
}

/**
 * Get tickets that need status update to OVERDUE
 * @param {Array} tickets - Array of ticket objects
 * @returns {Array} Tickets that should be marked as overdue
 */
export function getOverdueTickets(tickets) {
  if (!Array.isArray(tickets)) return [];

  return tickets.filter(ticket => {
    // Skip if already closed/resolved/overdue
    if (['CLOSED', 'RESOLVED', 'OVERDUE'].includes(ticket.status?.toUpperCase())) {
      return false;
    }

    const slaStatus = calculateSLAStatus(
      ticket.allocationDate,
      ticket.expectedResolutionDays,
      ticket.status
    );

    return slaStatus.isOverdue;
  });
}

/**
 * Format SLA display text
 * @param {Object} slaStatus - SLA status from calculateSLAStatus
 * @returns {string} Formatted display text
 */
export function formatSLADisplay(slaStatus) {
  if (slaStatus.status === 'not-set') {
    return 'SLA Not Set';
  }

  if (slaStatus.status === 'completed') {
    return slaStatus.resolvedOnTime ? 'Resolved On Time' : 'Resolved (Overdue)';
  }

  if (slaStatus.isOverdue) {
    return `${Math.abs(slaStatus.daysRemaining)} days overdue`;
  }

  if (slaStatus.status === 'warning') {
    return `${slaStatus.daysRemaining} days left (Due Soon)`;
  }

  return `${slaStatus.daysRemaining} days left`;
}

/**
 * Get SLA color class based on status
 * @param {Object} slaStatus - SLA status from calculateSLAStatus
 * @returns {Object} Tailwind color classes
 */
export function getSLAColorClasses(slaStatus) {
  if (slaStatus.status === 'not-set') {
    return {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
    };
  }

  if (slaStatus.status === 'completed') {
    return slaStatus.resolvedOnTime
      ? {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
        }
      : {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
        };
  }

  if (slaStatus.isOverdue) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    };
  }

  if (slaStatus.status === 'warning') {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    };
  }

  return {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  };
}
