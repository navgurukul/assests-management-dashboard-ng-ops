'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import GenericForm from '@/components/molecules/GenericForm';
import CustomButton from '@/components/atoms/CustomButton';
import StateHandler from '@/components/atoms/StateHandler';
import config from '@/app/config/env.config';
import {
  campusInchargeModalFields,
  campusInchargeValidationSchema,
  campusInchargeInitialValues,
} from '@/app/config/formConfigs/campusInchargeModalConfig';
import { toast } from '@/app/utils/toast';
import usePost from '@/app/hooks/query/usePost';
import usePatch from '@/app/hooks/query/usePatch';
import useFetch from '@/app/hooks/query/useFetch';

export default function CreateCampusIncharge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditMode = Boolean(editId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: schoolsResponse } = useFetch({
    url: config.endpoints.schools.list,
    queryKey: ['schools'],
  });

  const { data: campusListResponse, isLoading: isDetailLoading, isError: isDetailError, error: detailError } = useFetch({
    url: config.endpoints.campusIncharge.list,
    queryKey: ['campus-incharge'],
    enabled: isEditMode,
  });

  const campusDetail = useMemo(() => {
    if (!isEditMode || !campusListResponse?.data) return null;
    const records = campusListResponse.data;
    return records.find((item) => item.id === editId) || null;
  }, [campusListResponse, editId, isEditMode]);

  const editInitialValues = useMemo(() => {
    if (!campusDetail) return null;
    return {
      campus: campusDetail.campusName || campusDetail.campus?.campusName || '',
      address: campusDetail.campus?.address || '',
      state: campusDetail.campus?.state || '',
      campusCode: campusDetail.campus?.campusCode || '',
      capacity: campusDetail.campus?.capacity || '',
      schoolIds: Array.isArray(campusDetail.campus?.schoolIds) ? campusDetail.campus.schoolIds : campusDetail.campus?.schoolIds ? [campusDetail.campus.schoolIds] : [],
      campusManagerName: campusDetail.campusManager?.name || '',
      campusManagerEmail: campusDetail.campusManager?.email || '',
      campusManagerPhone: campusDetail.campusManager?.phone || '',
      itCoordinatorName: campusDetail.itCoordinator?.name || '',
      itCoordinatorEmail: campusDetail.itCoordinator?.email || '',
      itCoordinatorPhone: campusDetail.itCoordinator?.phone || '',
      operationName: campusDetail.operation?.name || '',
      operationEmail: campusDetail.operation?.email || '',
      operationPhone: campusDetail.operation?.phone || '',
      itLeadName: campusDetail.itLead?.name || '',
      itLeadEmail: campusDetail.itLead?.email || '',
      itLeadPhone: campusDetail.itLead?.phone || '',
    };
  }, [campusDetail]);

  const formFields = useMemo(() => {
    const schoolOptions = (schoolsResponse?.data?.schools || []).map((school) => ({
      value: school.id,
      label: school.name,
    }));

    return campusInchargeModalFields.map((field) => {
      let updatedField = field;

      if (field.name === 'schoolIds') {
        updatedField = { ...updatedField, options: schoolOptions };
      }

      if (isEditMode && ['campus', 'address', 'campusCode'].includes(field.name)) {
        updatedField = { ...updatedField, disabled: true };
      }

      if (isEditMode && campusDetail) {
        const emailSelectedItemMap = {
          campusManagerEmail: campusDetail.campusManager?.email
            ? { email: campusDetail.campusManager.email }
            : null,
          itCoordinatorEmail: campusDetail.itCoordinator?.email
            ? { email: campusDetail.itCoordinator.email }
            : null,
          operationEmail: campusDetail.operation?.email
            ? { email: campusDetail.operation.email }
            : null,
          itLeadEmail: campusDetail.itLead?.email
            ? { email: campusDetail.itLead.email }
            : null,
        };

        if (emailSelectedItemMap[field.name]) {
          updatedField = { ...updatedField, selectedItem: emailSelectedItemMap[field.name] };
        }
      }

      return updatedField;
    });
  }, [schoolsResponse, isEditMode, campusDetail]);

  const { mutateAsync: createCampusIncharge } = usePost({
    onSuccess: () => {
      toast.success('Campus Incharge created successfully');
      router.push('/userprofile');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create Campus Incharge');
    },
  });

  const { mutateAsync: updateCampusIncharge } = usePatch({
    onSuccess: () => {
      toast.success('Campus Incharge updated successfully');
      router.push('/userprofile');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update Campus Incharge');
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

      if (isEditMode) {
        await updateCampusIncharge({
          endpoint: config.endpoints.campusIncharge.update(editId),
          body: payload,
        });
      } else {
        await createCampusIncharge({
          endpoint: config.endpoints.campusIncharge.create,
          body: payload,
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} campus incharge:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/userprofile');
  };

  if (isEditMode && (isDetailLoading || isDetailError)) {
    return <StateHandler isLoading={isDetailLoading} isError={isDetailError} error={detailError} />;
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
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
          <div className="bg-(--surface) text-foreground rounded-xl shadow-sm border border-(--border) p-6">
            <h1 className="text-xl font-bold mb-2">
              {isEditMode ? 'Edit Campus Details' : 'Campus Details'}
            </h1>
            <p className="text-(--muted)">
              {isEditMode ? 'Update the campus details below' : 'Fill in the details below'}
            </p>
          </div>
        </div>
        <div className="bg-(--surface) text-foreground rounded-xl shadow-lg border border-(--border) p-8">
          <GenericForm
            fields={formFields}
            initialValues={isEditMode && editInitialValues ? editInitialValues : campusInchargeInitialValues}
            validationSchema={campusInchargeValidationSchema}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            submitButtonText={isEditMode ? 'Update Campus Incharge' : 'Create Campus Incharge'}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}