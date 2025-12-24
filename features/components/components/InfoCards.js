'use client';

import React from 'react';
import { ExternalLink, Calendar } from 'lucide-react';

export function CurrentlyInstalledCard({ deviceInfo }) {
  if (!deviceInfo) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Currently Installed In
        </h3>
        <p className="text-sm text-gray-500">Component is not currently installed in any device</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
        Currently Installed In
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Device Tag</span>
          <a 
            href={`/assets/${deviceInfo.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {deviceInfo.tag}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Device Type</span>
          <span className="text-sm font-medium text-gray-900">{deviceInfo.type}</span>
        </div>
        
        {deviceInfo.currentUser && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Current User</span>
            <span className="text-sm font-medium text-gray-900">{deviceInfo.currentUser}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Installation Date</span>
          <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(deviceInfo.installationDate).toLocaleDateString('en-IN')}
          </span>
        </div>
        
        {deviceInfo.location && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Location</span>
            <span className="text-sm font-medium text-gray-900">{deviceInfo.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PreviouslyInstalledCard({ devices = [] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
        Previously Installed In
      </h3>
      
      {devices.length === 0 ? (
        <p className="text-sm text-gray-500">No previous installation history</p>
      ) : (
        <div className="space-y-3">
          {devices.map((device, index) => (
            <div 
              key={index}
              className="p-3 bg-gray-50 rounded border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <a 
                  href={`/assets/${device.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {device.tag}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-xs text-gray-500">{device.type}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {new Date(device.installedFrom).toLocaleDateString('en-IN')} - 
                  {new Date(device.installedTo).toLocaleDateString('en-IN')}
                </span>
              </div>
              
              {device.removalReason && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Reason: </span>
                  {device.removalReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StorageHistoryCard({ storageHistory = [] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
        Storage History
      </h3>
      
      {storageHistory.length === 0 ? (
        <p className="text-sm text-gray-500">No storage history available</p>
      ) : (
        <div className="space-y-3">
          {storageHistory.map((storage, index) => (
            <div 
              key={index}
              className="p-3 bg-gray-50 rounded border border-gray-200"
            >
              <div className="text-sm font-medium text-gray-900 mb-2">
                {storage.campus} → {storage.almirah} → Shelf {storage.shelf}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {new Date(storage.from).toLocaleDateString('en-IN')}
                  {storage.to && ` - ${new Date(storage.to).toLocaleDateString('en-IN')}`}
                </span>
                {!storage.to && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-medium">
                    Current
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SummaryStatsCard({ stats }) {
  if (!stats) return null;

  return (
    <div className=" from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 border border-blue-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
        Summary Statistics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Component Age</p>
          <p className="text-lg font-bold text-gray-900">{stats.age}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-600 mb-1">Devices Used In</p>
          <p className="text-lg font-bold text-gray-900">{stats.devicesUsedIn}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-600 mb-1">Current Value</p>
          <p className="text-lg font-bold text-gray-900">₹{stats.currentValue?.toLocaleString('en-IN')}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-600 mb-1">Warranty Status</p>
          <p className={`text-sm font-semibold ${stats.warrantyExpired ? 'text-red-600' : 'text-green-600'}`}>
            {stats.warrantyExpired ? 'Expired' : stats.warrantyDaysLeft + ' days left'}
          </p>
        </div>
      </div>
    </div>
  );
}
