'use client';

import React, { useState, useEffect } from 'react';
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
import { useTheme } from '@/app/context/ThemeContext';

export default function UserProfileTab() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMandatoryFill, setIsMandatoryFill] = useState(false);
  const { isDark } = useTheme();

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
      setIsMandatoryFill(false);
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

  // Auto-open modal when phone, department, or location is missing
  useEffect(() => {
    if (!isLoadingUserData && rawUserData) {
      const isMissingInfo = !rawUserData.phone || !rawUserData.location;
      if (isMissingInfo) {
        setIsMandatoryFill(true);
        setIsEditModalOpen(true);
      }
    }
  }, [rawUserData, isLoadingUserData]);

  // Prevent closing the modal when it was auto-opened due to missing info
  const handleModalClose = () => {
    if (!isMandatoryFill) {
      setIsEditModalOpen(false);
    }
  };

  const editProfileFields = getEditProfileFields({
    phone: userData.phone,
    location: userData.location,
    campusId: rawUserData?.campusId || rawUserData?.campus?.id || '',
    school: rawUserData?.school || '',
  });

  if (isLoadingUserData && !rawUserData) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div>
      <FormModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        componentName=""
        actionType="Edit User Details"
        fields={editProfileFields}
        onSubmit={handleEditSubmit}
        size="medium"
        isSubmitting={isSubmitting}
        validationSchema={editProfileValidationSchema}
      />
      
      {/* Tab Heading */}
      <div className="mb-5">
        <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Personal Information
        </h2>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className={`flex items-start space-x-4 p-4 rounded-xl shadow-sm ${isDark ? 'profile-box-bg-dark' : 'profile-box-bg-light'}`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
            <Mail className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className={`text-xs mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{userData.email}</p>
          </div>
        </div>

        {/* Phone */}
        <div className={`flex items-start space-x-4 p-4 rounded-xl shadow-sm ${isDark ? 'profile-box-bg-dark' : 'profile-box-bg-light'}`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <Phone className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <div>
            <p className={`text-xs mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{userData.phone}</p>
          </div>
        </div>

        {/* Department */}
        <div className={`flex items-start space-x-4 p-4 rounded-xl shadow-sm ${isDark ? 'profile-box-bg-dark' : 'profile-box-bg-light'}`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
            <Building className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div>
            <p className={`text-xs mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Department</p>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{userData.department}</p>
          </div>
        </div>

        {/* Location */}
        <div className={`flex items-start space-x-4 p-4 rounded-xl shadow-sm ${isDark ? 'profile-box-bg-dark' : 'profile-box-bg-light'}`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
            <MapPin className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          </div>
          <div>
            <p className={`text-xs mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Location</p>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{userData.location}</p>
          </div>
        </div>

        {/* Join Date */}
        <div className={`flex items-start space-x-4 p-4 rounded-xl shadow-sm ${isDark ? 'profile-box-bg-dark' : 'profile-box-bg-light'}`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
            <Calendar className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
          <div>
            <p className={`text-xs mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Member Since</p>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{userData.joinDate}</p>
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
