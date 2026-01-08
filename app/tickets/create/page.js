'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import CustomButton from '@/components/atoms/CustomButton';
import GenericForm from '@/components/molecules/GenericForm';
import {
  ticketFormFields,
  ticketValidationSchema,
  ticketInitialValues,
} from '@/app/config/formConfigs/ticketFormConfig';

export default function CreateTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (values) => {
    // Backend POST is temporarily disabled while BE fixes are in progress
    alert('Ticket creation is temporarily unavailable while backend fixes are in progress.');
    router.push('/tickets');
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
