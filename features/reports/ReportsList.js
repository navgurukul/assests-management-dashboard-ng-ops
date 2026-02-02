'use client';

import React, { useState } from 'react';
import { BarChart3, Clock, TruckIcon, DollarSign, Recycle } from 'lucide-react';

const reportCards = [
  {
    id: 'allocation-summary',
    title: 'Allocation Summary',
    subtitle: 'Live device usage',
    icon: BarChart3,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'ticket-sla',
    title: 'Ticket SLA',
    subtitle: 'IT performance',
    icon: Clock,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 'movement-tracking',
    title: 'Movement Tracking',
    subtitle: 'Audit chain of custody',
    icon: TruckIcon,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 'vendor-courier-cost',
    title: 'Vendor + Courier Cost',
    subtitle: 'Finance governance',
    icon: DollarSign,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    id: 'parts-utilization',
    title: 'Parts Utilization',
    subtitle: 'Sustainability',
    icon: Recycle,
    bgColor: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
];

export default function ReportsList() {
  const [selectedReport, setSelectedReport] = useState(null);

  const handleCardClick = (reportId) => {
    setSelectedReport(reportId === selectedReport ? null : reportId);
  };

  return (
    <div className="space-y-6">
      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {reportCards.map((report) => {
          const IconComponent = report.icon;
          const isSelected = selectedReport === report.id;
          
          return (
            <div
              key={report.id}
              onClick={() => handleCardClick(report.id)}
              className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-full ${report.bgColor} flex items-center justify-center mb-4`}>
                <IconComponent className={report.iconColor} size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{report.title}</h3>
              <p className="text-sm text-gray-600">{report.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Report Details Section */}
      {selectedReport && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {reportCards.find((r) => r.id === selectedReport)?.title}
            </h2>
            <button
              onClick={() => setSelectedReport(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          {/* Content Area - You'll add content here later */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              Content for {reportCards.find((r) => r.id === selectedReport)?.title} will be added here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
