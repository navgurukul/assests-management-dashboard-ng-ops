'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import StepperForm from '@/components/molecules/StepperForm';
import CustomButton from '@/components/atoms/CustomButton';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
import {
  componentStepperConfig,
  componentFormValidationSchema,
  componentFormInitialValues,
} from '@/app/config/formConfigs/componentFormStepperConfig';
import { toast } from '@/app/utils/toast';

export default function CreateComponent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (values) => {
    console.log('Form submitted! Button clicked - Starting component creation...');
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToastId = toast.loading('Creating component...');
    
    try {
      console.log('Component form values:', values);
      
      // Transform form values to match API payload structure
      const payload = {
        assetTypeId: values.componentType, // componentType should be the ID
        brand: values.brand || '',
        model: values.modelNumber || '',
        specifications: values.specifications || '',
        serialNumber: values.serialNumber || '',
        source: values.sourceType || 'NEW_PURCHASE',
        // Purchase details (only if source is NEW_PURCHASE)
        invoiceNumber: values.sourceType === 'NEW_PURCHASE' ? (values.invoiceNumber || '') : '',
        purchaseOrderNumber: values.sourceType === 'NEW_PURCHASE' ? (values.purchaseOrderNumber || '') : '',
        vendorName: values.sourceType === 'NEW_PURCHASE' ? (values.purchaseVendorName || '') : '',
        vendorDetails: values.sourceType === 'NEW_PURCHASE' ? (values.vendorDetails || '') : '',
        purchaseDate: values.sourceType === 'NEW_PURCHASE' ? (values.purchaseDate || '') : '',
        purchasePrice: values.sourceType === 'NEW_PURCHASE' ? (values.purchasePrice || 0) : 0,
        warrantyExpiryDate: values.sourceType === 'NEW_PURCHASE' ? (values.warrantyExpiryDate || '') : '',
        // Extraction details (only if source is EXTRACTED)
        sourceAssetId: values.sourceType === 'EXTRACTED' ? (values.sourceDeviceTag || '') : '',
        sourceDeviceType: values.sourceType === 'EXTRACTED' ? (values.sourceDeviceType || '') : '',
        extractionDate: values.sourceType === 'EXTRACTED' ? (values.extractionDate || '') : '',
        extractionReason: values.sourceType === 'EXTRACTED' ? (values.extractionReason || '') : '',
        extractedByUserId: values.sourceType === 'EXTRACTED' ? (values.extractionTechnician || '') : '',
        // Status and location
        status: values.status || 'IN_STOCK',
        condition: values.condition || 'NEW',
        campusId: values.campusId || '',
        locationId: values.locationId || '',
        storageId: values.almirahId || values.storageId || '',
        shelfNumber: values.shelfNumber || '',
        ownedBy: values.ownedBy || 'lws',
        notes: values.notes || '',
      };

      // Remove empty extraction fields if source is NEW_PURCHASE
      if (values.sourceType === 'NEW_PURCHASE') {
        delete payload.sourceAssetId;
        delete payload.sourceDeviceType;
        delete payload.extractionDate;
        delete payload.extractionReason;
        delete payload.extractedByUserId;
      }

      // Remove empty purchase fields if source is EXTRACTED
      if (values.sourceType === 'EXTRACTED') {
        delete payload.invoiceNumber;
        delete payload.purchaseOrderNumber;
        delete payload.vendorName;
        delete payload.vendorDetails;
        delete payload.purchaseDate;
        delete payload.purchasePrice;
        delete payload.warrantyExpiryDate;
      }

      console.log('Component API payload:', payload);
      
      // Make API call to create component
      const response = await apiService.post(
        config.endpoints.components.create,
        payload
      );
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      const docSummary = values.linkedDocuments?.length 
        ? ` - ${values.linkedDocuments.length} document(s) linked`
        : '';
       
      toast.success(`Component created successfully!${docSummary}`);
      
      // Navigate back to components list
      router.push('/components');
      
    } catch (error) {
      console.error('Error creating component:', error);
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      // Show error toast
      const errorMessage = error?.message || error?.errors ? JSON.stringify(error.errors) : 'Failed to create component. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/components');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-4">
          <CustomButton
            text="Back to Components"
            icon={ArrowLeft}
            onClick={() => router.push('/components')}
            variant="secondary"
            size="sm"
            className="mb-6"
          />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Register New Component</h1>
            <p className="text-gray-600">Fill in the details below to add a new component to your inventory system</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-8 pt-6">
          <StepperForm
            steps={componentStepperConfig}
            initialValues={componentFormInitialValues}
            validationSchema={componentFormValidationSchema}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
