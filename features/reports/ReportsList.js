'use client';

import React, { useState } from 'react';
import { BarChart3, Clock, TruckIcon, DollarSign, Recycle, ArrowLeft } from 'lucide-react';
import ReportWrapper from '@/components/molecules/ReportWrapper';
import AllocationSummary from './AllocationSummary';

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
  const [filters, setFilters] = useState({});

  const handleCardClick = (reportId) => {
    setSelectedReport(reportId === selectedReport ? null : reportId);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExportCSV = () => {
    // Implement CSV export logic
  };

  const handleExportPDF = () => {
    // Implement PDF export logic
  };

  const campusOptions = ['Sarjapura', 'Pune', 'Dharamshala', 'Bangalore', 'Dantewada', 'Jashpur', 'Raipur', 'Amaravati', 'Udaipur', 'Jabalpur'];
  const statusOptions = ['Allocated', 'In Stock', 'Under Repair', 'In Courier', 'Scrap'];
  const assetTypeOptions = ['Laptop', 'Desktop', 'Tablet', 'Monitor'];
  const vendorOptions = ['TechCare', 'FixIT', 'CompuServe', 'ITSolutions'];
  const donorOptions = ['CSR Fund', 'Corporate Donation', 'Individual Donor'];

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'allocation-summary':
        return <AllocationSummary filters={filters} />;
      case 'ticket-sla':
        return (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Ticket SLA report content coming soon...</p>
          </div>
        );
      case 'movement-tracking':
        return (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Movement Tracking report content coming soon...</p>
          </div>
        );
      case 'vendor-courier-cost':
        return (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Vendor + Courier Cost report content coming soon...</p>
          </div>
        );
      case 'parts-utilization':
        return (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Parts Utilization report content coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading Section */}
      {!selectedReport && (
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Reports</h2>
          <p className="text-gray-600 mt-2">View and analyze various reports</p>
        </div>
      )}

      {/* Back Button */}
      {selectedReport && (
        <button
          onClick={() => setSelectedReport(null)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-blue-600"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Reports</span>
        </button>
      )}

      {/* Report Cards Grid */}
      {!selectedReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {reportCards.map((report) => {
            const IconComponent = report.icon;
            const isSelected = selectedReport === report.id;
            
            return (
              <div
                key={report.id}
                onClick={() => handleCardClick(report.id)}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${report.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={report.iconColor} size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">{report.title}</h3>
                    <p className="text-xs text-gray-600">{report.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Details Section */}
      {selectedReport && (
        <ReportWrapper
          title={reportCards.find((r) => r.id === selectedReport)?.title}
          subtitle={reportCards.find((r) => r.id === selectedReport)?.subtitle}
          campusOptions={campusOptions}
          statusOptions={statusOptions}
          assetTypeOptions={assetTypeOptions}
          vendorOptions={vendorOptions}
          donorOptions={donorOptions}
          onFilterChange={handleFilterChange}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          showDateRange={true}
          showExport={true}
        >
          {renderReportContent()}
        </ReportWrapper>
      )}
    </div>
  );
}
