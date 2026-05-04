'use client';

import React from 'react';
import DashboardCard from '@/components/atoms/DashboardCard';
import PieChart from '@/components/molecules/PieChart';
import StackedColumnChart from '@/components/molecules/StackedColumnChart';
import { dashboardCards } from '@/dummyJson/dummyJson';
import AssetsTable from '@/components/Table/Table';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';

function transformToStackedChartData(apiData) {
  const header = ['Campus', 'LWS', 'LIS', 'LCT', 'LR', 'LNW', 'LWFHE', 'LSD_B'];
  const rows = apiData.map((item) => [
    item.campus,
    item.LWS ?? 0,
    item.LIS ?? 0,
    item.LCT ?? 0,
    item.LR ?? 0,
    item.LNW ?? 0,
    item.LWFHE ?? 0,
    item.LSD_B ?? 0,
  ]);
  return [header, ...rows];
}

function transformToPieChartData(apiData) {
  const totalCampus = apiData.reduce((sum, item) => sum + (item.sub_total ?? 0), 0);
  const totalRemote = apiData.reduce(
    (sum, item) => sum + ((item.grand_total ?? 0) - (item.sub_total ?? 0)),
    0
  );
  return [
    ['Location', 'Count'],
    ['Campus', totalCampus],
    ['Remote', totalRemote],
  ];
}

export default function DashboardPage() {
  const legendLabels = {
    LWS: 'Laptops with Students',
    LIS: 'Laptops in Stock',
    LCT: 'Laptops with Campus Team',
    LR: 'Laptops Repairable',
    LNW: 'Non-Working Laptops',
    LWFHE: 'Work-from-Home Employees',
    LSD_B: 'Security Deposit/Bond',
  };

  const { data: response } = useFetch({
    url: config.endpoints.assets.consolidatedByCampus,
    queryKey: ['assets', 'consolidated-by-campus'],
  });

  const apiData = response?.data ?? [];
  const stackedChartData = transformToStackedChartData(apiData);
  const pieChartData = transformToPieChartData(apiData);

  return (
    <div className="p-6 overflow-y-auto h-full bg-[linear-gradient(135deg,var(--background)_0%,var(--surface-soft)_100%)]">
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
            data={stackedChartData}
            title="Assets - per Campus"
            colors={['#93C5FD', '#A5B4FC', '#C4B5FD', '#FB923C', '#FDBA74', '#6EE7B7', '#5EEAD4']}
            height="500px"
            hAxisTitle="Campus"
            vAxisTitle="Count"
            showDropdown={true}
            dropdownLabel="Campus(If Applicable):"
            showLegendLabels={legendLabels}
          />
        </div>
        <div className="lg:col-span-3">
          <PieChart
            data={pieChartData}
            title="Location wise Assets"
            colors={['#93C5FD', '#5EEAD4']}
            height="500px"
          />
        </div>
      </div>
      <AssetsTable />
    </div>
  );
}