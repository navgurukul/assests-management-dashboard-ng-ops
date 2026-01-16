'use client';

import React from 'react';
import { Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

/**
 * SLAIndicator Component
 * Displays SLA timeline status with visual indicators
 * 
 * @param {Object} props
 * @param {string} props.allocationDate - Date when ticket was allocated (ISO string)
 * @param {string} props.expectedResolutionDate - Expected resolution date (ISO string)
 * @param {string} props.status - Current ticket status
 * @param {boolean} props.compact - Show compact version
 */
export default function SLAIndicator({ 
  allocationDate, 
  expectedResolutionDate, 
  status = 'OPEN',
  compact = false 
}) {
  // If no SLA data, show "Not Set"
  if (!allocationDate || !expectedResolutionDate) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
        <Clock size={compact ? 14 : 16} />
        <span>SLA Not Set</span>
      </div>
    );
  }

  const allocation = new Date(allocationDate);
  const expectedResolution = new Date(expectedResolutionDate);
  
  const now = new Date();
  const daysElapsed = Math.floor((now - allocation) / (1000 * 60 * 60 * 24));
  const totalDays = Math.floor((expectedResolution - allocation) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.floor((expectedResolution - now) / (1000 * 60 * 60 * 24));
  
  // Check if ticket is closed/resolved
  const isCompleted = ['CLOSED', 'RESOLVED'].includes(status?.toUpperCase());
  
  // Determine status
  let slaStatus = 'on-track'; // green
  let statusText = 'On Track';
  let icon = <Clock size={compact ? 14 : 16} />;
  let bgColor = 'bg-green-50';
  let textColor = 'text-green-700';
  let borderColor = 'border-green-200';

  if (isCompleted) {
    slaStatus = 'completed';
    statusText = daysElapsed <= totalDays ? 'Resolved On Time' : 'Resolved (Overdue)';
    icon = <CheckCircle size={compact ? 14 : 16} />;
    bgColor = daysElapsed <= totalDays ? 'bg-green-50' : 'bg-orange-50';
    textColor = daysElapsed <= totalDays ? 'text-green-700' : 'text-orange-700';
    borderColor = daysElapsed <= totalDays ? 'border-green-200' : 'border-orange-200';
  } else if (daysRemaining < 0) {
    slaStatus = 'overdue';
    statusText = 'Overdue';
    icon = <AlertTriangle size={compact ? 14 : 16} />;
    bgColor = 'bg-red-50';
    textColor = 'text-red-700';
    borderColor = 'border-red-200';
  } else if (daysRemaining <= 2) {
    slaStatus = 'warning';
    statusText = 'Due Soon';
    icon = <AlertTriangle size={compact ? 14 : 16} />;
    bgColor = 'bg-yellow-50';
    textColor = 'text-yellow-700';
    borderColor = 'border-yellow-200';
  }

  // Compact version for table/list views
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${bgColor} ${textColor} ${borderColor}`}>
        {icon}
        <span className="font-medium text-xs">
          {isCompleted ? statusText : `${Math.abs(daysRemaining)}d ${daysRemaining < 0 ? 'overdue' : 'left'}`}
        </span>
      </div>
    );
  }

  // Full version for detail views
  return (
    <div className={`p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`${textColor} mt-0.5`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-semibold text-sm ${textColor}`}>{statusText}</h4>
            <span className={`text-xs font-medium px-2 py-1 rounded ${bgColor} ${textColor}`}>
              {totalDays} days SLA
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar size={12} />
              <span>Allocated: {allocation.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar size={12} />
              <span>Expected: {expectedResolution.toLocaleDateString()}</span>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    slaStatus === 'overdue' ? 'bg-red-500' :
                    slaStatus === 'warning' ? 'bg-yellow-500' :
                    slaStatus === 'completed' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (daysElapsed / totalDays) * 100)}%` 
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Day {daysElapsed} of {totalDays}</span>
                {!isCompleted && (
                  <span className={daysRemaining < 0 ? 'text-red-600 font-semibold' : ''}>
                    {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
