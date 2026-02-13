'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectTicket, clearSelectedTicket } from '@/app/store/slices/ticketSlice';
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
import apiService from '@/app/utils/apiService';

export default function CreateAllocation() {
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedTicket = useSelector(selectTicket);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modifiedFormFields, setModifiedFormFields] = useState(allocationFormFields);
  const [modifiedInitialValues, setModifiedInitialValues] = useState(allocationInitialValues);

  useEffect(() => {
    if (selectedTicket?.assigneeUser?.email) {
      // Modify form fields to disable userEmail field
      const updatedFields = allocationFormFields.map(field => {
        if (field.name === 'userEmail') {
          return {
            ...field,
            disabled: true,
            helperText: 'Email pre-populated from ticket assignee',
          };
        }
        return field;
      });
      setModifiedFormFields(updatedFields);

      // Set initial value for userEmail
      setModifiedInitialValues({
        ...allocationInitialValues,
        userEmail: selectedTicket.assigneeUser.email,
      });
    }

    // Cleanup: clear selected ticket when component unmounts
    return () => {
      dispatch(clearSelectedTicket());
    };
  }, [selectedTicket, dispatch]);

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
          allocationType: 'Remote',
          assetIds: [values.assetId],
          allocationReason: values.allocationReason,
          notes: values.notes || null,
        };
        
        // Add optional fields only if they have values
        if (values.userEmail) allocationData.userEmail = values.userEmail;
        if (values.phoneNumber) allocationData.phoneNumber = values.phoneNumber;
        if (values.userAddress) allocationData.userAddress = values.userAddress;
        
      } else if (values.allocationType === 'CAMPUS') {
        // Campus allocation - bulk assets transfer
        const assetIds = values.campusAssets.map(asset => asset.assetId);
        allocationData = {
          allocationType: 'Campus',
          assetIds: assetIds,
          sourceCampusName: values.sourceCampus,
          destinationCampusName: values.destinationCampus,
          personRaisingRequest: values.personRaising,
          allocationReason: values.allocationReason,
          notes: values.notes || null,
        };
      } else {
        throw new Error('Invalid allocation type');
      }

      // Make API call to create allocation using apiService wrapper
      const result = await apiService.post(
        config.endpoints.allocations.create,
        allocationData
      );

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

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
            fields={modifiedFormFields}
            initialValues={modifiedInitialValues}
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
