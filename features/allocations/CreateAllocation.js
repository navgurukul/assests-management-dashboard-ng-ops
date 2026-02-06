'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import GenericForm from '@/components/molecules/GenericForm';
import CustomButton from '@/components/atoms/CustomButton';
import config from '@/app/config/env.config';
import {
  allocationFormFields,
  allocationValidationSchema,
  allocationInitialValues,
} from '@/app/config/formConfigs/allocationFormConfig';
import { toast } from '@/app/utils/toast';

export default function CreateAllocation() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToastId = toast.loading('Creating allocation...');
    
    try {
      let allocationData;
      
      // Prepare data based on allocation type
      if (values.allocationType === 'REMOTE') {
        // Remote allocation - single user with single asset
        allocationData = {
          allocationType: 'REMOTE',
          userEmail: values.userEmail,
          userName: values.userName,
          userPhone: values.userPhone || null,
          userDepartment: values.userDepartment || null,
          userAddress: values.userAddress || null,
          assetId: values.assetId,
          assetSource: values.assetSource || null,
          startDate: values.startDate,
          allocationReason: values.allocationReason,
          notes: values.notes || null,
        };
      } else if (values.allocationType === 'CAMPUS') {
        // Campus allocation - bulk assets transfer
        allocationData = {
          allocationType: 'CAMPUS',
          sourceCampus: values.sourceCampus,
          destinationCampus: values.destinationCampus,
          personRaising: values.personRaising,
          campusAssets: values.campusAssets, // Array of {assetId, workingCondition}
          startDate: values.startDate,
          allocationReason: values.allocationReason,
          notes: values.notes || null,
        };
      } else {
        throw new Error('Invalid allocation type');
      }

      // Make API call to create allocation
      const response = await fetch(config.getApiUrl(config.endpoints.allocations?.create || '/allocations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allocationData),
      });

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to create allocation';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Allocation created successfully:', result);
      
      // Show success toast
      const successMessage = values.allocationType === 'CAMPUS' 
        ? `Campus allocation created successfully! ${values.campusAssets.length} asset(s) allocated.`
        : 'Remote allocation created successfully!';
      toast.success(successMessage);
      
      // Navigate back to allocations list
      router.push('/allocations');
      
    } catch (error) {
      console.error('Error creating allocation:', error);
      
      // Show error toast
      toast.error(error?.message || 'Failed to create allocation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/allocations');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-4">
          <CustomButton
            text="Back to Allocations"
            icon={ArrowLeft}
            onClick={() => router.push('/allocations')}
            variant="secondary"
            size="sm"
            className="mb-6"
          />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Create New Allocation</h1>
            {/* Info Box */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">Choose Allocation Type:</p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4">
                <li>• <strong>Remote:</strong> Allocate assets to individual users (students, employees) with user details</li>
                <li>• <strong>Campus:</strong> Bulk transfer of assets between campus locations with working conditions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <GenericForm
            fields={allocationFormFields}
            initialValues={allocationInitialValues}
            validationSchema={allocationValidationSchema}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            submitButtonText="Create Allocation"
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
