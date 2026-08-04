'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import CustomButton from '@/components/atoms/CustomButton';
import GenericForm from '@/components/molecules/GenericForm';
import post from '@/app/api/post/post';
import config from '@/app/config/env.config';
import {
  ticketFormFields,
  ticketValidationSchema,
  ticketInitialValues,
} from '@/app/config/formConfigs/ticketFormConfig';
import { toast } from '@/app/utils/toast';
import { useSelector } from 'react-redux';
import { selectUserRole } from '@/app/store/slices/appSlice';
import useFetch from '@/app/hooks/query/useFetch';

export default function CreateTicket() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userRole = useSelector(selectUserRole);

  // Fetch the current user's manager automatically
  const { data: managerData, isLoading: isLoadingManager } = useFetch({
    url: config.endpoints.user.myManager,
    queryKey: ['myManager'],
  });

  const manager = managerData?.data?.manager;
  const managerEmail = manager?.email || '';

  // Build dynamic fields with conditional manager field
  const dynamicFields = useMemo(() => {
    return ticketFormFields.map((field) => {
      if (field.name === 'managerEmail') {
        // If loading, show loading message
        if (isLoadingManager) {
          return {
            ...field,
            placeholder: 'Loading...',
          };
        }
        // If manager is null, show helpful message but keep disabled
        if (!manager) {
          return {
            ...field,
            placeholder: 'No manager found.',
          };
        }
        // Manager found - show as disabled field with approval context
        return {
          ...field,
          helpText: `This ticket will be sent to ${manager.firstName || ''} ${manager.lastName || ''}`.trim() + ' for approval.',
        };
      }
      return field;
    });
  }, [manager, isLoadingManager]);

  // Pre-fill managerEmail from the fetched manager
  const initialValues = useMemo(() => ({
    ...ticketInitialValues,
    managerEmail,
  }), [managerEmail]);

  const handleFormSubmit = async (values) => {
    // Prevent submission if manager is not set
    if (!manager || !values.managerEmail) {
      toast.error('Please update your manager from your profile before creating a ticket.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToastId = toast.loading('Creating ticket...');
    
    try {
      
      // Prepare payload - exclude assetId and campusId for NEW tickets
      const payload = { ...values };
      if (values.ticketType === 'NEW') {
        delete payload.assetId;
        delete payload.campusId;
      } else if (values.ticketType === 'REPAIR') {
        delete payload.address;
      }
      
      // Make API call to create ticket using post helper with auth
      const result = await post({
        url: config.getApiUrl(config.endpoints.tickets.create),
        method: 'POST',
        data: payload,
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      // Show success toast
      toast.success(`Ticket created successfully! Ticket Tag: ${result.data.ticketNumber}`);
      
      // Navigate based on user role
      if (userRole === 'STUDENT' || userRole === 'EMPLOYEE' || userRole === 'MANAGER') {
        router.push('/ticketstatus');
      } else {
        router.push('/tickets');
      }
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      const errorMessage = error?.message || 'Failed to create ticket';
      const errorDetails = error?.errors ? ` - ${JSON.stringify(error.errors)}` : '';
      
      // Show error toast
      toast.error(`${errorMessage}${errorDetails}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (userRole === 'STUDENT' || userRole === 'EMPLOYEE' || userRole === 'MANAGER') {
      router.push('/ticketstatus');
    } else {
      router.push('/tickets');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-4">
          <CustomButton
            text="Back"
            icon={ArrowLeft}
            onClick={handleCancel}
            variant="secondary"
            size="sm"
            className="mb-6"
          />
          
          <div className="bg-(--surface) text-foreground rounded-xl shadow-sm border border-(--border) p-6">
            <h1 className="text-xl font-bold mb-2">Create New Ticket</h1>
            <p className="text-(--muted)">Fill in the details below to raise a new ticket</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-(--surface) text-foreground rounded-xl shadow-lg border border-(--border) p-8">
          {/* Show warning if manager is not set */}
          {!isLoadingManager && !manager && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Manager not found.</strong> Please update your manager from your profile before creating a ticket.
                  </p>
                  <button
                    onClick={() => router.push('/userprofile')}
                    className="mt-2 text-sm font-medium text-yellow-700 underline hover:text-yellow-800"
                  >
                    Go to Profile →
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <GenericForm
            fields={dynamicFields}
            initialValues={initialValues}
            validationSchema={ticketValidationSchema}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitButtonText="Create Ticket"
            cancelButtonText="Cancel"
          />
        </div>
      </div>
    </div>
  );
}
