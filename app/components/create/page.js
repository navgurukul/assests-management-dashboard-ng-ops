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

export default function CreateComponentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      console.log('Component created with values:', values);
      console.log('Linked Documents:', values.linkedDocuments);
      
      // Make API call to create component
      const response = await apiService.post(
        config.endpoints.components.create,
        values
      );
      
      const docSummary = values.linkedDocuments?.length 
        ? `\n${values.linkedDocuments.length} document(s) linked`
        : '\nNo documents linked';
      
      alert(`Component created successfully!\nComponent Tag: ${values.componentTag}\nType: ${values.componentType}${docSummary}`);
      
      // Navigate back to components list
      router.push('/components');
      
    } catch (error) {
      console.error('Error creating component:', error);
      alert('Failed to create component. Please try again.');
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
            <h1 className="text-xl font-bold text-gray-900 mb-2">Create New Component</h1>
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
