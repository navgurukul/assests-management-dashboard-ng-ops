'use client';

import { assetDetailsData } from '@/dummyJson/dummyJson';

export default function AssetDetails({ assetId, onBack }) {
  const assetDetails = assetDetailsData[assetId];

  if (!assetDetails) {
    return (
      <div className="p-6">
        <p>Asset not found</p>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (assetDetails.status) {
      case 'Repair':
        return 'text-red-600';
      case 'Allocated':
        return 'text-green-600';
      case 'In Stock':
        return 'text-blue-600';
      case 'Scrap':
        return 'text-gray-600';
      default:
        return 'text-gray-900';
    }
  };

  const tabs = ['Specs', 'Components', 'Allocation', 'Ticket History', 'Movement Log'];

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ASSET: {assetDetails.assetTag}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Status: </span>
                <span className={`text-sm font-semibold ${getStatusColor()}`}>
                  {assetDetails.status}
                </span>
                <span className="text-sm text-gray-600 ml-4">SLA Risk: </span>
                <span className={`text-sm font-semibold ${
                  assetDetails.slaRisk.includes('HIGH') || assetDetails.slaRisk.includes('RED')
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {assetDetails.slaRisk}
                </span>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`px-4 py-2 text-sm font-medium ${
                  index === 0
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specs Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Specs
            </h2>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Brand</span>
                <span className="text-sm font-medium text-gray-900">{assetDetails.specs.brand}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">CPU</span>
                <span className="text-sm font-medium text-gray-900">{assetDetails.specs.cpu}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">RAM</span>
                <span className="text-sm font-medium text-gray-900">{assetDetails.specs.ram}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">SSD</span>
                <span className="text-sm font-medium text-gray-900">{assetDetails.specs.ssd}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Purchase</span>
                <span className="text-sm font-medium text-gray-900">{assetDetails.specs.purchase}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Donor</span>
                <span className="text-sm font-medium text-gray-900">{assetDetails.specs.donor}</span>
              </div>
            </div>

            {/* Components Table */}
            {assetDetails.components && assetDetails.components.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">Component Tag</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">Type</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">Status</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">Installed On</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">Slot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetDetails.components.map((component, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 text-gray-700">{component.componentTag}</td>
                        <td className="py-2 text-gray-700">{component.type}</td>
                        <td className="py-2 text-gray-700">{component.status}</td>
                        <td className="py-2 text-gray-700">{component.installedOn}</td>
                        <td className="py-2 text-gray-700">{component.slot}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Movement Log Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Movement Log (timeline)
            </h2>
            <div className="space-y-3">
              {assetDetails.movementLog.map((log, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">{log.date}</span>
                  <span className="text-sm font-medium text-gray-900">{log.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
