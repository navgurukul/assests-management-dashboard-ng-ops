'use client';

import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import DashboardCard from '@/components/atoms/DashboardCard';
import PieChart from '@/components/molecules/PieChart';
import StackedBarChart from '@/components/molecules/StackedBarChart';
import StackedColumnChart from '@/components/molecules/StackedColumnChart';
import TableWrapper from '@/components/Table/TableWrapper';
import Pagination from '@/components/atoms/Pagination';
import { 
  allocationSummaryKPIs, 
  assetsByCampusData, 
  assetsBySourceData,
  allocatedVsInStockData,
  allocationTableData 
} from '@/dummyJson/dummyJson';

export default function AllocationSummary({ filters }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filter and search data
  const filteredData = allocationTableData.filter((item) => {
    const matchesSearch = 
      item.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.campus.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const columns = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'campus', label: 'Campus', sortable: true },
    { key: 'withWhom', label: 'With', sortable: false },
    { key: 'source', label: 'Source', sortable: true },
    { key: 'lastAction', label: 'Last Action', sortable: false },
    { key: 'lastUpdated', label: 'Last Updated', sortable: true },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {allocationSummaryKPIs.map((kpi, index) => (
          <DashboardCard
            key={index}
            count={kpi.count}
            label={kpi.label}
            icon={kpi.icon}
            iconColor={kpi.iconColor}
            borderColor={kpi.borderColor}
            bgColor={kpi.bgColor}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StackedBarChart
          data={assetsByCampusData}
          title="Assets by Campus"
          height="400px"
          colors={['#60A5FA', '#93C5FD', '#FCA5A5', '#FCD34D', '#FB923C', '#A78BFA']}
        />
        <PieChart
          data={assetsBySourceData}
          title="Assets by Source"
          height="400px"
          colors={['#60A5FA', '#34D399', '#FBBF24']}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <StackedColumnChart
          data={allocatedVsInStockData}
          title="Allocated vs In Stock Over Time"
          height="350px"
          colors={['#60A5FA', '#93C5FD']}
        />
      </div>

      {/* Allocation Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Allocation Details</h3>
        </div>

        {/* Search and Group By */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              <option value="none">Group by: None</option>
              <option value="campus">Group by: Campus</option>
              <option value="status">Group by: Status</option>
              <option value="source">Group by: Source</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Table */}
        <TableWrapper>
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortConfig.key === column.key && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-blue-600 font-medium">{row.assetTag}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.type}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Allocated'
                        ? 'bg-green-100 text-green-800'
                        : row.status === 'In Stock'
                        ? 'bg-blue-100 text-blue-800'
                        : row.status === 'Under Repair'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.campus}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.withWhom}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.source === 'Purchased'
                        ? 'bg-blue-100 text-blue-800'
                        : row.source === 'Donated'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {row.source}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.lastAction}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{row.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>

        {/* Pagination */}
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}
