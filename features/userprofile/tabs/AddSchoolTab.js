'use client';

import React, { useState } from 'react';
import { BuildingIcon, School, Trash2 } from 'lucide-react';
import GenericForm from '@/components/molecules/GenericForm';
import CustomButton from '@/components/atoms/CustomButton';
import ConfirmationModal from '@/components/molecules/ConfirmationModal';
import { addSchoolFormFields } from '@/dummyJson/dummyJson';
import { toast } from '@/app/utils/toast';
import * as Yup from 'yup';
import useFetch from '@/app/hooks/query/useFetch';
import usePost from '@/app/hooks/query/usePost';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import config from '@/app/config/env.config';
import apiService from '@/app/utils/apiService';

const validationSchema = Yup.object().shape({
  schoolName: Yup.string().required('School Name is required'),
  contactNumber: Yup.string().required('Contact Number is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  address: Yup.string().required('Address is required'),
});

export default function AddSchoolTab() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, schoolId: null });
  const queryClient = useQueryClient();

  const { data: apiResponse, isLoading, isError, error } = useFetch({
    url: config.endpoints.schools.list,
    queryKey: ['schools'],
  });

  const { mutateAsync: createSchool } = usePost({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    }
  });

  const { mutateAsync: deleteSchool, isPending: isDeleting } = useMutation({
    mutationFn: (id) => apiService.delete(config.endpoints.schools.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School deleted successfully');
      setDeleteModal({ isOpen: false, schoolId: null });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete school');
      setDeleteModal({ isOpen: false, schoolId: null });
    }
  });

  const handleDeleteConfirm = async () => {
    if (deleteModal.schoolId) {
      await deleteSchool(deleteModal.schoolId);
    }
  };

  const schoolsList = apiResponse?.data?.schools || [];

  const initialValues = {
    schoolName: '',
    contactNumber: '',
    email: '',
    address: '',
  };

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      await createSchool({
        endpoint: config.endpoints.schools.create,
        body: {
          name: values.schoolName,
        }
      });
      toast.success('School added successfully');
      resetForm();
    } catch (error) {
      toast.error(error?.message || 'Failed to add school');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Schools List */}
      <div className="lg:col-span-1 border border-(--border) bg-(--surface) rounded-lg shadow-sm">
        <div className="p-4 border-b border-(--border)">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <School className="w-5 h-5 text-(--theme-main)" />
            Existing Schools
          </h2>
        </div>
        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <span className="text-sm text-(--muted)">Loading schools...</span>
            </div>
          ) : isError ? (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              Failed to load schools. {error?.message}
            </div>
          ) : schoolsList.length === 0 ? (
            <div className="text-center p-4 text-(--muted) text-sm">
              No schools found.
            </div>
          ) : (
            schoolsList.map((school) => (
              <div key={school.id} className="p-3 border border-(--border) rounded-md bg-background hover:border-(--theme-main) transition-colors flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{school.name}</h3>
                  <div className="text-xs text-(--muted) mt-1.5 space-y-1">
                    <p><span className="font-medium">Users:</span> {school.userCount || 0}</p>
                    <p><span className="font-medium">Created:</span> {new Date(school.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteModal({ isOpen: true, schoolId: school.id })}
                  className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                  title="Delete School"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Add Form */}
      <div className="lg:col-span-2 bg-(--surface) rounded-lg shadow-sm border border-(--border)">
        <div className="p-4 border-b border-(--border) flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BuildingIcon className="w-5 h-5 text-(--theme-main)" />
              Add New School
            </h2>
            <p className="text-sm text-(--muted) mt-1">
              Fill in the details to add a new school to the system.
            </p>
          </div>
        </div>
        <div className="p-6">
          <GenericForm
            fields={addSchoolFormFields}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-(--border)">
              <CustomButton 
                type="reset" 
                variant="outline" 
                disabled={isSubmitting}
              >
                Cancel
              </CustomButton>
              <CustomButton 
                type="submit" 
                isLoading={isSubmitting}
              >
                Add School
              </CustomButton>
            </div>
          </GenericForm>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, schoolId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete School"
        message="Are you sure you want to delete this school? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
}