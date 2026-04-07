'use client';

import React, { useState, useEffect } from 'react';
import { User, Package, Ticket, Building2 } from 'lucide-react';
import { UserProfileTab, MyAssetsTab, TicketStatusTab, TicketApprovalTab, CampusInchargeTab } from './tabs';
import config from '@/app/config/env.config';
import useFetch from '@/app/hooks/query/useFetch';
import { useAppSelector } from '@/app/store/hooks';
import { selectUserRole } from '@/app/store/slices/appSlice';

const tabs = [
  { id: 'userprofile', label: 'User Profile', icon: User, Component: UserProfileTab },
  { id: 'myassets', label: 'My Assets', icon: Package, Component: MyAssetsTab },
  { id: 'ticketstatus', label: 'My Ticket Status', icon: Ticket, Component: TicketStatusTab },
  { id: 'ticketforapproval', label: 'Ticket for Approval', icon: Ticket, Component: TicketApprovalTab },
  { id: 'campusincharge', label: 'Campus Incharge', icon: Building2, Component: CampusInchargeTab },
];

export default function UserProfileDetails() {
  const [activeTab, setActiveTab] = useState('userprofile');
  const storeUserRole = useAppSelector(selectUserRole);

  // Fetch user data using React Query
  const { 
    data: userDataResponse, 
  } = useFetch({
    url: config.endpoints.user.me,
    queryKey: ['userMe'],
    enabled: true
  });

  // Extract user data from response or use fallback
  const rawUserData = userDataResponse?.data || userDataResponse || null;
  
  // Transform API response to match component expectations
  const userData = rawUserData ? {
    name: `${rawUserData.firstName || ''} ${rawUserData.lastName || ''}`.trim() || 'User',
    email: rawUserData.email || '',
    phone: rawUserData.phone || '',
    role: rawUserData.role || '',
    department: rawUserData.department || '',
    location: rawUserData.location || '',
    joinDate: rawUserData.createdAt ? new Date(rawUserData.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : '',
    avatar: null,
  } : {
    name: 'Loading...',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: '',
    joinDate: '',
    avatar: null,
  };

  const currentRole = storeUserRole || userData.role;

  const filteredTabs = tabs.filter(tab => {
    if ((currentRole === 'STUDENT' || currentRole === 'EMPLOYEE') && 
        (tab.id === 'ticketforapproval' || tab.id === 'campusincharge' || tab.id === 'myassets' || tab.id === 'ticketstatus')) {
      return false;
    }
    return true;
  });

  const ActiveTabComponent = filteredTabs.find(tab => tab.id === activeTab)?.Component;

  return (
    <>
      <div className="h-full overflow-y-auto bg-[var(--background)] p-4"> 
        {/* Breadcrumb */}
        <div className="mb-3 text-xs text-[var(--muted)]">
          <span className="hover:text-[var(--theme-main)] cursor-pointer">Dashboard</span>
          <span className="mx-2">›</span>
          <span className="font-medium text-[var(--foreground)]">User Profile</span>
        </div>

        {/* Header */}
        <div className="bg-[var(--surface)] rounded-lg shadow-sm p-4 mb-4 border border-[var(--border)]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 rounded-full flex items-center justify-center w-16 h-16">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">
                  {userData.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold border border-[var(--theme-light)] bg-[var(--surface-soft)] text-[var(--theme-main)]">
                    {userData.role}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {userData.department}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[var(--surface)] rounded-lg shadow-sm border border-[var(--border)] mb-4">
          <div className="border-b border-[var(--border)]">
            <div className="flex overflow-x-auto">
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-[var(--theme-main)] text-[var(--theme-main)] bg-[var(--surface-soft)]'
                        : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border)]'
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
              />
            )}
          </div>
        </div>
       
    </div>
    </>
  );
}
