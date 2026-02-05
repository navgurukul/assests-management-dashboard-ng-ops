'use client';

import React from 'react';
import DashboardCard from '@/components/atoms/DashboardCard';
import PieChart from '@/components/molecules/PieChart';
import StackedColumnChart from '@/components/molecules/StackedColumnChart';
import { dashboardCards, locationWiseAssetsData, assetsPerCampusData } from '@/dummyJson/dummyJson';
import AssetsTable from '@/components/Table/Table';

export default function DashboardPage() {
  const legendLabels = {
    'LWS': 'Laptops with Students',
    'LIS': 'Laptops in Stock',
    'LR': 'Laptops Repairable',
    'LNW': 'Non-Working Laptops',
    'LWFHE': 'Laptops with Work-from-Home Employees',
    'LCT': 'Laptops with Campus Team',
    'LASLFH': 'Laptops with Amaravati Students Learning from Home',
    'LSD': 'Laptops with Security Deposit',
    'LB': 'Laptops with Bond',
    'LSJOP': 'Laptops for Student Job Observation Period',
    'LNGIN': 'Laptops with NG Interns'
  };

  return (
    <div className="p-6 overflow-y-auto h-full bg-gradient-to-br from-gray-50 to-blue-50"> 
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardCards.map((card) => (
          <DashboardCard
            key={card.id}
            count={card.count}
            label={card.label}
            icon={card.icon}
            bgColor={card.bgColor}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-6">
        <div className="lg:col-span-7">
          <StackedColumnChart 
            data={assetsPerCampusData}
            title="Assets - per Campus"
            colors={['#93C5FD', '#A5B4FC', '#C4B5FD', '#FB923C', '#FDBA74', '#6EE7B7', '#5EEAD4', '#A7F3D0', '#FDE68A', '#BAE6FD', '#A5F3FC']}
            height="500px"
            hAxisTitle="Campus(If Applicable)"
            vAxisTitle="Campus(If Applicable) Count"
            showDropdown={true}
            dropdownLabel="Campus(If Applicable):"
            showLegendLabels={legendLabels}
          />
        </div>
        <div className="lg:col-span-3">
          <PieChart 
            data={locationWiseAssetsData}
            title="Location wise Assets"
            colors={['#93C5FD', '#5EEAD4']}
            height="500px"
          />
        </div>
      </div>
      <AssetsTable/>
    </div>
  );
}
