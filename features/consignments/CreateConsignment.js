'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import GenericForm from '@/components/molecules/GenericForm';
import CustomButton from '@/components/atoms/CustomButton';
import config from '@/app/config/env.config';
import {
  consignmentFormFields,
  consignmentValidationSchema,
  consignmentInitialValues,
} from '@/app/config/formConfigs/consignmentFormConfig';
import { toast } from '@/app/utils/toast';

export default function CreateConsignment() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToastId = toast.loading('Creating consignment...');
    
    try {
      // Prepare payload for API
      const payload = {
        allocationId: values.allocationId,
        assetIds: values.assets, // Array of asset IDs
        courierServiceId: values.courierServiceId,
        trackingLink: values.trackingLink || null,
        trackingId: values.trackingId || null,
        shippedAt: values.shippedAt,
        estimatedDeliveryDate: values.estimatedDeliveryDate,
        notes: values.notes || null,
      };

      console.log('Consignment API payload:', payload);
      
      // Make API call to create consignment
      const response = await fetch(config.getApiUrl(config.endpoints.consignments.create), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.message || `Failed to create consignment (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Consignment created successfully:', result);
      
      // Show success toast
      toast.success('Consignment created successfully!');
      
      // Navigate back to consignments list
      router.push('/consignments');
      
    } catch (error) {
      console.error('Error creating consignment:', error);
      
      // Show error toast
      toast.error(error?.message || 'Failed to create consignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/consignments');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-4">
          <CustomButton
            text="Back to Consignments"
            icon={ArrowLeft}
            onClick={() => router.push('/consignments')}
            variant="secondary"
            size="sm"
            className="mb-6"
          />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Register New Consignment</h1>
            <p className="text-gray-600">Fill in the details below to register a new consignment in the system</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <GenericForm
            fields={consignmentFormFields}
            initialValues={consignmentInitialValues}
            validationSchema={consignmentValidationSchema}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            submitButtonText="Create Consignment"
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
