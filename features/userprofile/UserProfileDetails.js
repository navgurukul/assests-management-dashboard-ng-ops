'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Package, Ticket, Building2, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserProfileTab, MyAssetsTab, TicketStatusTab, TicketApprovalTab, CampusInchargeTab, ManagerListTab, CampusLocationTab, AddSchoolTab } from './tabs';
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
  { id: 'campuslocation', label: 'Campus Location', icon: Building2, Component: CampusLocationTab },
  { id: 'addschool', label: 'Add School', icon: Building2, Component: AddSchoolTab },
  // { id: 'managerlist', label: 'Manager List', icon: Users, Component: ManagerListTab },
];

export default function UserProfileDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInternalChange = useRef(false);
  
  // Initialize activeTab from URL directly (avoid extra render)
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams?.get('tab');
    return tabFromUrl || 'userprofile';
  });
  
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

  // Memoize filteredTabs - only recreate when currentRole changes
  const filteredTabs = useMemo(() => {
    return tabs.filter(tab => {
      // For MANAGER, STUDENT, EMPLOYEE, only show 'userprofile' option
      if ((currentRole === 'MANAGER' || currentRole === 'STUDENT' || currentRole === 'EMPLOYEE') && tab.id !== 'userprofile') {
        return false;
      }

      const adminOnlyTabs = ['campusincharge', 'campuslocation', 'addschool'];
      
      // Only ADMIN should see these tabs
      if (adminOnlyTabs.includes(tab.id) && currentRole !== 'ADMIN') {
        return false;
      }

      return true;
    });
  }, [currentRole]); // Only recreate when currentRole changes

  //  Handle external changes only (browser back/forward, email links, etc.)
  //  Validate against currentRole and filteredTabs
  useEffect(() => {
    if (!currentRole) return; // Wait for role to load
    
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return; // Skip internal changes
    }
    
    const tabFromUrl = searchParams?.get('tab');
    const isValid = filteredTabs.some(t => t.id === tabFromUrl);
    
    if (tabFromUrl && isValid) {
      setActiveTab(tabFromUrl);
    } else if (tabFromUrl && !isValid) {
      // Fallback to 'userprofile' if unauthorized tab is in URL
      setActiveTab('userprofile');
      router.replace('/userprofile?tab=userprofile', { scroll: false });
    }
  }, [currentRole, searchParams, filteredTabs]);

  // Handle tab change - mark as internal, update URL and state
  const handleTabChange = (tabId) => {
    isInternalChange.current = true;
    setActiveTab(tabId);
    router.replace(`/userprofile?tab=${tabId}`, { scroll: false });
  };

  const ActiveTabComponent = filteredTabs.find(tab => tab.id === activeTab)?.Component;

  return (
    <>
      <div className="h-full overflow-y-auto bg-background p-4"> 
        {/* Header */}
        <div className="bg-(--surface) rounded-lg shadow-sm p-4 mb-4 border border-(--border)">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 rounded-full flex items-center justify-center w-16 h-16">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1">
                  {userData.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold border border-(--theme-light) bg-(--surface-soft) text-(--theme-main)">
                    {userData.role}
                  </span>
                  <span className="text-xs text-(--muted)">
                    {userData.department}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-(--surface) rounded-lg shadow-sm border border-(--border) mb-4">
          <div className="border-b border-(--border)">
            <div className="flex overflow-x-auto">
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-(--theme-main) text-(--theme-main) bg-(--surface-soft)'
                        : 'border-transparent text-(--muted) hover:text-foreground hover:border-(--border)'
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