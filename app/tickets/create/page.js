'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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

export default function CreateTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToastId = toast.loading('Creating ticket...');
    
    try {
      console.log('Creating ticket with values:', values);
      
      // Prepare payload - exclude assetId and campusId for NEW tickets
      const payload = { ...values };
      if (values.ticketType === 'NEW') {
        delete payload.assetId;
        delete payload.campusId;
      }
      
      // Make API call to create ticket using post helper with auth
      const result = await post({
        url: config.getApiUrl(config.endpoints.tickets.create),
        method: 'POST',
        data: payload,
      });

      console.log('Ticket created successfully:', result);
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      // Show success toast
      toast.success(`Ticket created successfully! Ticket Number: ${result.data.ticketNumber}`);
      
      // Navigate back to tickets list
      router.push('/tickets');
      
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
    router.push('/tickets');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-4">
          <CustomButton
            text="Back to Tickets"
            icon={ArrowLeft}
            onClick={() => router.push('/tickets')}
            variant="secondary"
            size="sm"
            className="mb-6"
          />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Create New Ticket</h1>
            <p className="text-gray-600">Fill in the details below to raise a new ticket</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <GenericForm
            fields={ticketFormFields}
            initialValues={ticketInitialValues}
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
