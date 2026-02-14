'use client';

import React, { useState, useEffect } from 'react';
import { User, Package, Ticket } from 'lucide-react';
import { UserProfileTab, MyAssetsTab, TicketStatusTab, TicketApprovalTab } from './tabs';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
import useFetch from '@/app/hooks/query/useFetch';
import FormModal from '@/components/molecules/FormModal';
import post from '@/app/api/post/post';
import { toast } from '@/app/utils/toast';

const tabs = [
  { id: 'userprofile', label: 'User Profile', icon: User, Component: UserProfileTab },
  { id: 'myassets', label: 'My Assets', icon: Package, Component: MyAssetsTab },
  { id: 'ticketstatus', label: 'Ticket Status', icon: Ticket, Component: TicketStatusTab },
  { id: 'ticketforapproval', label: 'Ticket for Approval', icon: Ticket, Component: TicketApprovalTab },
];

export default function UserProfileDetails({ userAssets: initialAssets, userTickets: initialTickets }) {
  const [activeTab, setActiveTab] = useState('userprofile');
  const [userTickets, setUserTickets] = useState(initialTickets || []);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState(null);
  const [hasTicketsFetched, setHasTicketsFetched] = useState(!!initialTickets);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for approval tickets
  const [approvalTickets, setApprovalTickets] = useState([]);
  const [isLoadingApprovalTickets, setIsLoadingApprovalTickets] = useState(false);
  const [approvalTicketsError, setApprovalTicketsError] = useState(null);
  const [hasApprovalTicketsFetched, setHasApprovalTicketsFetched] = useState(false);
  // Fetch user data using React Query
  const { 
    data: userDataResponse, 
    isLoading: isLoadingUserData, 
    error: userDataError,
    refetch: refetchUserData
  } = useFetch({
    url: config.endpoints.user.me,
    queryKey: ['userMe'],
    enabled: true
  });

  // Console log the user data response
  useEffect(() => {
    if (userDataResponse) {
      console.log('User data response:', userDataResponse);
    }
  }, [userDataResponse]);

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
    if (activeTab === 'ticketforapproval' && !hasApprovalTicketsFetched) {
      fetchApprovalTickets();
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

  const fetchApprovalTickets = async () => {
    setIsLoadingApprovalTickets(true);
    setApprovalTicketsError(null);
    try {
      const response = await apiService.get(config.endpoints.tickets.pendingApproval);
      setApprovalTickets(response.data || response || []);
      setHasApprovalTicketsFetched(true);
    } catch (error) {
      console.error('Error fetching approval tickets:', error);
      setApprovalTicketsError(error.message || 'Failed to load approval tickets');
      setApprovalTickets([]);
    } finally {
      setIsLoadingApprovalTickets(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Updating profile...');
    
    try {
      await post({
        url: config.getApiUrl(config.endpoints.user.me),
        method: 'PUT',
        data: formData,
      });
      
      toast.dismiss(loadingToastId);
      toast.success('Profile updated successfully');
      setIsEditModalOpen(false);
      
      // Refetch user data without page reload
      refetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.dismiss(loadingToastId);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editProfileFields = [
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter phone number',
      required: false,
      defaultValue: userData.phone || '',
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Enter location',
      required: false,
      defaultValue: userData.location || '',
    },
  ];

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.Component;

  return (
    <>
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        componentName=""
        actionType="Edit User Details"
        fields={editProfileFields}
        onSubmit={handleEditSubmit}
        size="small"
        isSubmitting={isSubmitting}
      />
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
                approvalTickets={approvalTickets}
                isLoadingApprovalTickets={isLoadingApprovalTickets}
                approvalTicketsError={approvalTicketsError}
                onRefresh={fetchApprovalTickets}
                onEditProfile={() => setIsEditModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
