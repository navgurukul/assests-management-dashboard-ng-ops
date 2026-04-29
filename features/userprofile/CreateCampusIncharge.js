'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import GenericForm from '@/components/molecules/GenericForm';
import CustomButton from '@/components/atoms/CustomButton';
import config from '@/app/config/env.config';
import {
  campusInchargeModalFields,
  campusInchargeValidationSchema,
  campusInchargeInitialValues,
} from '@/app/config/formConfigs/campusInchargeModalConfig';
import { toast } from '@/app/utils/toast';
import usePost from '@/app/hooks/query/usePost';
import useFetch from '@/app/hooks/query/useFetch';
import { form } from '@nextui-org/react';

export default function CreateCampusIncharge() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: schoolsResponse } = useFetch({
    url: config.endpoints.schools.list,
    queryKey: ['schools'],
  });

  const formFields = useMemo(() => {
    const schoolOptions = (schoolsResponse?.data?.schools || []).map((school) => ({
      value: school.id,
      label: school.name,
    }));

    return campusInchargeModalFields.map((field) =>
      field.name === 'schoolIds' ? { ...field, options: schoolOptions } : field
    );
  }, [schoolsResponse]);

  const { mutateAsync: createCampusIncharge } = usePost({
    onSuccess: () => {
      toast.success('Campus Incharge created successfully');
      router.push('/userprofile');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create Campus Incharge');
    },
  });

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        campusName: formData.campus,
        campusCode: formData.campusCode,
        address: formData.address,
        state: formData.state,
        capacity: Number(formData.capacity),
        schoolIds: formData.schoolIds,
        campusManager: {
          name: formData.campusManagerName,
          email: formData.campusManagerEmail,
          phone: formData.campusManagerPhone,
        },
        itCoordinator: {
          name: formData.itCoordinatorName,
          email: formData.itCoordinatorEmail,
          phone: formData.itCoordinatorPhone,
        },
        operation: {
          name: formData.operationName,
          email: formData.operationEmail,
          phone: formData.operationPhone,
        },
        itLead: {
          name: formData.itLeadName,
          email: formData.itLeadEmail,
          phone: formData.itLeadPhone,
        },
      };
      await createCampusIncharge({
        endpoint: config.endpoints.campusIncharge.create,
        body: payload,
      });
    } catch (error) {
      console.error('Error creating campus incharge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/userprofile');
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)]">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4">
          <CustomButton
            text="Back to User Profile"
            icon={ArrowLeft}
            onClick={handleCancel}
            variant="secondary"
            size="sm"
            className="mb-6"
          />
          <div className="bg-[var(--surface)] text-[var(--foreground)] rounded-xl shadow-sm border border-[var(--border)] p-6">
            <h1 className="text-xl font-bold mb-2">Campus Details</h1>
            <p className="text-[var(--muted)]">
              Fill in the details below
            </p>
          </div>
        </div>
        <div className="bg-[var(--surface)] text-[var(--foreground)] rounded-xl shadow-lg border border-[var(--border)] p-8">
          <GenericForm
            fields={formFields}
            initialValues={campusInchargeInitialValues}
            validationSchema={campusInchargeValidationSchema}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            submitButtonText="Create Campus Incharge"
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}