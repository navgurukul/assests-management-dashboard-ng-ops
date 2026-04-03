'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Building } from 'lucide-react';
import CustomButton from '@/components/atoms/CustomButton';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import post from '@/app/api/post/post';
import { toast } from '@/app/utils/toast';
import FormModal from '@/components/molecules/FormModal';
import {
  getEditProfileFields,
  editProfileValidationSchema,
} from '@/app/config/formConfigs/editProfileModalConfig';

export default function UserProfileTab() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const editProfileFields = getEditProfileFields({
    phone: userData.phone,
    location: userData.location,
    campusId: rawUserData?.campusId || rawUserData?.campus?.id || '',
  });

  if (isLoadingUserData && !rawUserData) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div>
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        componentName=""
        actionType="Edit User Details"
        fields={editProfileFields}
        onSubmit={handleEditSubmit}
        size="medium"
        isSubmitting={isSubmitting}
        validationSchema={editProfileValidationSchema}
      />
      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{userData.email}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
            <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Phone</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{userData.phone}</p>
          </div>
        </div>

        {/* Department */}
        <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
            <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Department</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{userData.department}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-lg">
            <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Location</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{userData.location}</p>
          </div>
        </div>

        {/* Join Date */}
        <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Member Since</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{userData.joinDate}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <CustomButton 
          text="Edit Profile" 
          variant="primary" 
          size="md"
          onClick={() => setIsEditModalOpen(true)}
        />
      </div>
    </div>
  );
}
