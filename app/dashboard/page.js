'use client';

import React,  { useState, useEffect, useMemo} from 'react';
import DashboardCard from '@/components/atoms/DashboardCard';
import PieChart from '@/components/molecules/PieChart';
import StackedColumnChart from '@/components/molecules/StackedColumnChart'; 
import AssetsTable from '@/components/Table/Table';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { MOCK_DATA, SUB_TYPES,ASSET_TYPES } from '@/dummyJson/dummyJson';


// --- Original Chart Data Transformers ---
function transformOriginalStackedChartData(apiData) {
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

function transformOriginalPieChartData(apiData) {
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

// --- Filtered Chart Data Transformers ---
function processFilteredData(data) {
  const grouped = {};
  data.forEach(item => {
    if (!grouped[item.campus]) {
      grouped[item.campus] = { campus: item.campus, inStock: 0, allocated: 0, repair: 0, nonWorking: 0, grandTotal: 0 , subTotal: 0, withStudents: 0, remote: 0, campusTeam: 0 };
    }
    grouped[item.campus].inStock += item.inStock;
    grouped[item.campus].allocated += item.allocated;
    grouped[item.campus].repair += item.repair;
    grouped[item.campus].nonWorking += item.nonWorking;
    grouped[item.campus].subTotal += item.subTotal || 0;
    grouped[item.campus].withStudents += item.withStudents || 0;
    grouped[item.campus].remote += item.remote || 0;
    grouped[item.campus].campusTeam += item.campusTeam || 0;
    grouped[item.campus].grandTotal += (item.inStock + item.allocated + item.repair + item.nonWorking);
  });
  return Object.values(grouped);
}

function transformToStackedChartData(aggregatedData) {
  const header = ['Campus', 'In Stock', 'Allocated', 'Needs Repair', 'Non-Working'];
  const rows = aggregatedData.map((item) => [
    item.campus,
    item.inStock,
    item.allocated,
    item.repair,
    item.nonWorking,
  ]);
  return [header, ...rows];
}

function transformToPieChartData(aggregatedData) {
  let inStock = 0, allocated = 0, repair = 0, nonWorking = 0;
  aggregatedData.forEach(item => {
    inStock += item.inStock;
    allocated += item.allocated;
    repair += item.repair;
    nonWorking += item.nonWorking;
  });
  
  return [
    ['Status', 'Count'],
    ['In Stock', inStock],
    ['Allocated', allocated],
    ['Needs Repair', repair],
    ['Non-Working', nonWorking],
  ];
}

export default function DashboardPage() {
  const [category, setCategory] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [subType, setSubType] = useState('ALL');
  const [assetTypesByCategory, setAssetTypesByCategory] = useState({
    DIGITAL: [],
    NON_DIGITAL: [],
  });

  const { data: response } = useFetch({
    url: config.endpoints.assets.consolidatedByCampus,
    queryKey: ['assets', 'consolidated-by-campus'],
  });
  const apiData = response?.data ?? [];

  // Fetch asset types from API
  const { data: assetTypesResponse } = useFetch({
    url: config.getApiUrl(config.endpoints.assets.types),
    queryKey: ['asset-types'],
  });

  // Process asset types from API - organize by category
  useEffect(() => {
    if (assetTypesResponse?.data) {
      const digitalTypes = [];
      const nonDigitalTypes = [];

      assetTypesResponse.data.forEach(item => {
        if (item.category === 'DEVICE') {
          digitalTypes.push(item.name);
        } else if (item.category === 'NON_DEVICE') {
          nonDigitalTypes.push(item.name);
        }
      });

      setAssetTypesByCategory({
        DIGITAL: digitalTypes.length > 0 ? digitalTypes : ASSET_TYPES.DIGITAL,
        NON_DIGITAL: nonDigitalTypes.length > 0 ? nonDigitalTypes : ASSET_TYPES.NON_DIGITAL,
      });
    } else {
      // Fallback to frontend data if API fails
      setAssetTypesByCategory(ASSET_TYPES);
    }
  }, [assetTypesResponse]);

  const isFiltered = category !== 'ALL' || type !== 'ALL' || subType !== 'ALL';

  const originalLegendLabels = {
    LWS: 'Laptops with Students',
    LIS: 'Laptops in Stock',
    LCT: 'Lapt. Campus Team',
    LR: 'Laptops Repairable',
    LNW: 'Non-Working Laptops',
    LWFHE: 'WFH Employees',
    LSD_B: 'Security Deposit/Bond',
  };

  const filteredLegendLabels = {
    'In Stock': 'Assets In Stock',
    'Allocated': 'Assets Allocated',
    'Needs Repair': 'Assets Needing Repair',
    'Non-Working': 'Non-Working/Scrap Assets',
  };

  const activeLegendLabels = isFiltered ? filteredLegendLabels : originalLegendLabels;

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setType('ALL');
    setSubType('ALL');
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setSubType('ALL');
  };

  const handleChipTypeChange = (newType) => {
    if (newType === 'Overview') {
      setType('ALL');
      setSubType('ALL');
      return;
    }
    setType(newType);
    setSubType('ALL');
  };

  const filteredMocks = useMemo(() => {
    return MOCK_DATA.filter((item) => {
      if (category !== 'ALL' && item.category !== category) return false;
      if (type !== 'ALL' && item.type !== type) return false;
      if (subType !== 'ALL' && item.subType !== subType) return false;
      return true;
    });
  }, [category, type, subType]);

  const aggregatedData = useMemo(() => processFilteredData(filteredMocks), [filteredMocks]);

  const stackedChartData = isFiltered
    ? transformToStackedChartData(aggregatedData)
    : transformOriginalStackedChartData(apiData);

  const pieChartData = isFiltered
    ? transformToPieChartData(aggregatedData)
    : transformOriginalPieChartData(apiData);

  // Calculate top cards based on state
  const totalAssets = isFiltered 
    ? aggregatedData.reduce((sum, item) => sum + item.grandTotal, 0)
    : apiData.reduce((sum, item) => sum + (item.grand_total ?? 0), 0);
  
  const totalInStock = isFiltered
    ? aggregatedData.reduce((sum, item) => sum + item.inStock, 0)
    : apiData.reduce((sum, item) => sum + (item.LIS ?? 0), 0);
    
  const totalNeedsRepair = isFiltered
    ? aggregatedData.reduce((sum, item) => sum + item.repair, 0)
    : apiData.reduce((sum, item) => sum + (item.LR ?? 0), 0);
    
  const totalNonWorking = isFiltered
    ? aggregatedData.reduce((sum, item) => sum + item.nonWorking, 0)
    : apiData.reduce((sum, item) => sum + (item.LNW ?? 0), 0);

  const dashboardCards = [
    { id: 1, count: totalAssets,     label: 'Total Assets',  icon: 'Package',      bgColor: 'bg-teal-100',  iconColor: 'text-teal-600'  },
    { id: 2, count: totalInStock,    label: 'In Stock',       icon: 'Archive',      bgColor: 'bg-blue-100',  iconColor: 'text-blue-600'  },
    { id: 3, count: totalNeedsRepair,label: 'Needs Repair',   icon: 'Settings',     bgColor: 'bg-slate-100', iconColor: 'text-slate-600' },
    { id: 4, count: totalNonWorking, label: 'Non-Working',    icon: 'XCircle',      bgColor: 'bg-red-100',   iconColor: 'text-red-600'   },
  ];

  const allAssetTypes = useMemo(() => {
    if (category === 'DIGITAL') return assetTypesByCategory.DIGITAL;
    if (category === 'NON_DIGITAL') return assetTypesByCategory.NON_DIGITAL;
    // ALL — show both
    return [
      ...assetTypesByCategory.DIGITAL,
      ...assetTypesByCategory.NON_DIGITAL,
    ];
  }, [category, assetTypesByCategory]);

  return (
    <div className="p-6 overflow-y-auto h-full bg-[linear-gradient(135deg,var(--background)_0%,var(--surface-soft)_100%)]">
      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Category Buttons */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 rounded-lg p-1 bg-gray-100">
              {['ALL', 'DIGITAL', 'NON_DIGITAL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat === 'DIGITAL' ? 'Digital' : 'Non-Digital'}
                </button>
              ))}
            </div>
          </div>

          {/* Type and Sub-type Dropdowns */}
          {category !== 'ALL' && (
            <div className="flex items-center gap-4">
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1 sr-only">Asset Type</label>
                <select value={type} onChange={handleTypeChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
                  <option value="ALL">All {category === 'DIGITAL' ? 'Digital' : 'Non-Digital'} Types</option>
                  {(assetTypesByCategory[category] || []).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {type !== 'ALL' && SUB_TYPES[type] && (
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sr-only">Item/Sub Type</label>
                  <select value={subType} onChange={(e) => setSubType(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
                    <option value="ALL">All {type} Items</option>
                    {(SUB_TYPES[type] || []).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Asset Type Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleChipTypeChange('Overview')}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
              type === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Overview ({totalAssets})
          </button>
          {type !== 'ALL' && SUB_TYPES[type]
            ? // SubType chips
              SUB_TYPES[type].map((st) => (
                <button
                  key={st}
                  onClick={() => setSubType((prev) => (prev === st ? 'ALL' : st))}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    subType === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {st.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))
            : // Asset type chips
              allAssetTypes.map((assetType) => (
                <button
                  key={assetType}
                  onClick={() => handleChipTypeChange(assetType)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    type === assetType
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {assetType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
        </div>
      </div>

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
            title={isFiltered ? "Asset Status - per Campus" : "Assets - per Campus"}
            colors={isFiltered ? ['#93C5FD', '#A5B4FC', '#FB923C', '#FCA5A5'] : ['#93C5FD', '#A5B4FC', '#C4B5FD', '#FB923C', '#FDBA74', '#6EE7B7', '#5EEAD4']}
            height="500px"
            hAxisTitle="Campus"
            vAxisTitle="Count"
            showLegendLabels={activeLegendLabels}
          />
        </div>
        <div className="lg:col-span-3">
          <PieChart
            data={pieChartData}
            title={isFiltered ? "Overall Status Distribution" : "Location wise Assets"}
            colors={isFiltered ? ['#93C5FD', '#A5B4FC', '#FB923C', '#FCA5A5'] : ['#93C5FD', '#5EEAD4']}
            height="500px"
          />
        </div>
      </div>
     <AssetsTable isFiltered={isFiltered} dummyData={aggregatedData} type={type} subType={subType} category={category} />
    </div>
  );
}