'use client';

import React, { useState, useEffect } from 'react';
import { User, Package, Ticket } from 'lucide-react';
import { UserProfileTab, MyAssetsTab, TicketStatusTab } from './tabs';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
import useFetch from '@/app/hooks/query/useFetch';

const tabs = [
  { id: 'userprofile', label: 'User Profile', icon: User, Component: UserProfileTab },
  { id: 'myassets', label: 'My Assets', icon: Package, Component: MyAssetsTab },
  { id: 'ticketstatus', label: 'Ticket Status', icon: Ticket, Component: TicketStatusTab },
];

export default function UserProfileDetails({ userData, userAssets: initialAssets, userTickets: initialTickets }) {
  const [activeTab, setActiveTab] = useState('userprofile');
  const [userTickets, setUserTickets] = useState(initialTickets || []);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState(null);
  const [hasTicketsFetched, setHasTicketsFetched] = useState(!!initialTickets);

  // Use React Query hook for assets with lazy loading
  const { 
    data: userAssets = [], 
    isLoading: isLoadingAssets, 
    error: assetsError 
  } = useFetch({
    url: config.endpoints.allocations.myAssets,
    queryKey: ['myAssets'],
    enabled: activeTab === 'myassets'
  });

  // Fetch tickets when the ticket status tab becomes active for the first time
  useEffect(() => {
    if (activeTab === 'ticketstatus' && !hasTicketsFetched) {
      fetchUserTickets();
    }
  }, [activeTab]);

  const fetchUserTickets = async () => {
    setIsLoadingTickets(true);
    setTicketsError(null);
    try {
      const response = await apiService.get(config.endpoints.tickets.myTickets);
      setUserTickets(response.data || response || []);
      setHasTicketsFetched(true);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      setTicketsError(error.message || 'Failed to load tickets');
      setUserTickets([]);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.Component;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-3 text-xs text-gray-600">
          <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
          <span className="mx-2">›</span>
          <span className="font-medium text-gray-900">User Profile</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 rounded-full flex items-center justify-center w-16 h-16">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {userData.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold border bg-blue-100 text-blue-800 border-blue-300">
                    {userData.role}
                  </span>
                  <span className="text-xs text-gray-600">
                    {userData.department}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {ActiveTabComponent && (
              <ActiveTabComponent 
                userData={userData}
                userAssets={userAssets}
                userTickets={userTickets}
                isLoadingTickets={isLoadingTickets}
                ticketsError={ticketsError}
                isLoadingAssets={isLoadingAssets}
                assetsError={assetsError?.message || (assetsError ? 'Failed to load assets' : null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
