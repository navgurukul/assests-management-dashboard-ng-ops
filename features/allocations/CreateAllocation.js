'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectTicket, clearSelectedTicket } from '@/app/store/slices/ticketSlice';
import { ArrowLeft, Info } from 'lucide-react';
import Modal from '@/components/molecules/Modal';
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
  const searchParams = useSearchParams();
  const ticketIdFromQuery = searchParams.get('ticketId');
  const dispatch = useDispatch();
  const selectedTicket = useSelector(selectTicket);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modifiedFormFields, setModifiedFormFields] = useState(allocationFormFields);
  const [modifiedInitialValues, setModifiedInitialValues] = useState(allocationInitialValues);

  useEffect(() => {
    if (selectedTicket) {
      // Modify form fields to disable userEmail and/or userAddress fields
      const updatedFields = allocationFormFields.map(field => {
        if (field.name === 'userEmail' && selectedTicket?.raisedByUser?.email) {
          return {
            ...field,
            disabled: true,
            helperText: 'Email pre-populated from ticket raiser',
          };
        }
        if (field.name === 'userAddress') {
          return {
            ...field,
            disabled: true,
            helperText: 'Address pre-populated from ticket',
          };
        }
        return field;
      });
      setModifiedFormFields(updatedFields);

      // Set initial values for userEmail and userAddress
      setModifiedInitialValues({
        ...allocationInitialValues,
        ...(selectedTicket?.raisedByUser?.email && { userEmail: selectedTicket.raisedByUser.email }),
        userAddress: selectedTicket?.address || '',
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
          sourceCampusId: values.campusId,
          allocationReason: values.allocationReason,
          notes: values.notes || null,
        };
        
        // Add optional fields only if they have values
        if (values.userEmail) allocationData.userEmail = values.userEmail;
        if (values.phoneNumber) allocationData.phoneNumber = values.phoneNumber;
        if (values.userAddress) allocationData.userAddress = values.userAddress;
      } else if (values.allocationType === 'CAMPUS') {
        // Campus allocation - bulk assets transfer
        const assetIds = values.campusAssets.map(asset => asset.id);
        allocationData = {
          allocationType: 'Campus',
          assetIds: assetIds,
          sourceCampusId: values.sourceCampus,
          destinationCampusId: values.destinationCampus,
          allocationReason: values.allocationReason,
          notes: values.notes || null,
        };
      } else {
        throw new Error('Invalid allocation type');
      }

      // Add ticketId for both allocation types if available
      const resolvedTicketId = selectedTicket?.id || ticketIdFromQuery;
      if (resolvedTicketId) {
        allocationData.ticketId = resolvedTicketId;
      }

      // Make API call to create allocation using apiService wrapper
      const result = await apiService.post(
        config.endpoints.allocations.create,
        allocationData
      );

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
      toast.dismiss(loadingToastId);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/allocations');
  };

  // Field callbacks for form field changes
  const fieldCallbacks = {
    clearAssetSelections: (value, formik) => {
      formik.setFieldValue('assetTypeId', '');
      formik.setFieldValue('assetId', '');
    },
    clearAssetId: (value, formik) => {
      // Clear assetId when assetType changes
      formik.setFieldValue('assetId', '');
    },
    clearSourceCampusDependents: (value, formik) => {
      formik.setFieldValue('destinationCampus', '');
      formik.setFieldValue('destinationCampusName', '');
      formik.setFieldValue('campusAssets', []);
    },
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)]">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-1">
          <CustomButton
            text="Back to Allocations"
            icon={ArrowLeft}
            onClick={() => router.push('/allocations')}
            variant="secondary"
            size="sm"
            className="mb-6"
          />
          
          
        </div>

        {/* Form Container */}
        <div className="bg-[var(--surface)] text-[var(--foreground)] rounded-xl shadow-lg border border-[var(--border)] px-8 py-4">
          {/* <div className="bg-[var(--surface)] text-[var(--foreground)] rounded-xl shadow-sm border border-[var(--border)] p-6"> */}
            <div className="flex items-center justify-between py-4">
              <h1 className="text-xl font-bold">Create New Allocation</h1>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(true)}
                className="p-1.5 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                title="Allocation type info"
              >
                <Info size={20} />
              </button> 
          </div>
          <GenericForm
            fields={modifiedFormFields}
            initialValues={modifiedInitialValues}
            validationSchema={allocationValidationSchema}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            submitButtonText="Create Allocation"
            isSubmitting={isSubmitting}
            fieldCallbacks={fieldCallbacks}
          />
        </div>
      </div>

      {/* Info Modal */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Allocation Type Information"
        size="medium"
      >
        <div className="p-4">
          <p className="text-sm text-blue-800 font-medium mb-3">Choose Allocation Type:</p>
          <ul className="text-sm text-blue-700 space-y-2 ml-4">
            <li>• <strong>Remote:</strong> Allocate assets to individual users (students, employees) with user details</li>
            <li>• <strong>Campus:</strong> Bulk transfer of assets between campus locations with working conditions</li>
            <li>• <strong>NOTE:</strong> An individual User can only have two laptops at a time.*</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}
