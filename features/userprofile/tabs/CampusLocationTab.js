'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, Building2, Plus, Trash2 } from 'lucide-react';
import { useQueryClient , useMutation} from '@tanstack/react-query';
import FormModal from '@/components/molecules/FormModal';
import CustomButton from '@/components/atoms/CustomButton';
import StateHandler from '@/components/atoms/StateHandler';
import useFetch from '@/app/hooks/query/useFetch';
import usePost from '@/app/hooks/query/usePost';
import { toast } from '@/app/utils/toast';
import config from '@/app/config/env.config';
import {
  createLocationFields,
  createLocationValidationSchema,
} from '@/app/config/formConfigs/campusLocationModalConfig';
import apiService from '@/app/utils/apiService';
import ConfirmationModal from '@/components/molecules/ConfirmationModal';

export default function CampusLocationTab() {
  const queryClient = useQueryClient();
  const [selectedCampusId, setSelectedCampusId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, locationId: null });

  const {
    data: locationsResponse,
    isLoading: isLoadingLocations,
    isError: isErrorLocations,
    error: locationsError,
  } = useFetch({
    url: '/locations',
    queryKey: ['locations'],
  });

  const {
    data: campusesResponse,
    isLoading: isLoadingCampuses,
    isError: isErrorCampuses,
  } = useFetch({
    url: '/campuses',
    queryKey: ['campuses'],
  });

  const campusList = useMemo(() => {
    return campusesResponse?.data || [];
  }, [campusesResponse]);

  const locationsByCampus = useMemo(() => {
    const locations = locationsResponse?.data || [];
    return locations.reduce((accumulator, location) => {
      const { campusId } = location;
      if (!accumulator[campusId]) {
        accumulator[campusId] = [];
      }
      accumulator[campusId].push(location);
      return accumulator;
    }, {});
  }, [locationsResponse]);

  const activeCampusId = selectedCampusId ?? campusList[0]?.id ?? null;
  const selectedCampus = campusList.find((campus) => campus.id === activeCampusId);
  const selectedLocations = locationsByCampus[activeCampusId] || [];

  const { mutateAsync: createLocation, isPending: isSubmitting } = usePost({
    onSuccess: () => {
      toast.success('Location created successfully');
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsCreateModalOpen(false);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to create location');
    },
  });

  const { mutateAsync: deleteLocation, isPending: isDeleting } = useMutation({
    mutationFn: (id) => apiService.delete(config.endpoints.locations.details(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
      setDeleteModal({ isOpen: false, locationId: null });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete location');
      setDeleteModal({ isOpen: false, locationId: null });
    },
  });

  const handleCreateLocationSubmit = async (formData) => {
    await createLocation({
      endpoint: config.endpoints.locations.list,
      body: { campusId: activeCampusId, name: formData.name, type: formData.type, isActive: true },
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.locationId) {
      await deleteLocation(deleteModal.locationId);
    }
  };

  const isLoading = isLoadingLocations || isLoadingCampuses;
  const isError = isErrorLocations || isErrorCampuses;

  if (isLoading || isError) {
    return (
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        error={locationsError}
        loadingMessage="Loading locations..."
        errorMessage="Failed to load locations"
        className="h-64"
      />
    );
  }

  return (
    <div className="flex gap-4 min-h-[500px]">
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        actionType="Create Location"
        componentName={selectedCampus?.campusName || ''}
        fields={createLocationFields}
        onSubmit={handleCreateLocationSubmit}
        size="medium"
        isSubmitting={isSubmitting}
        validationSchema={createLocationValidationSchema}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, locationId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
      {/* Campus Sidebar */}
      <div className="w-56 shrink-0 border border-(--border) rounded-lg overflow-hidden bg-(--surface)">
        <div className="px-3 py-2.5 border-b border-(--border) bg-(--surface-soft)">
          <p className="text-xs font-semibold text-(--muted) uppercase tracking-wide">Campuses</p>
        </div>
        <ul className="divide-y divide-(--border)">
          {campusList.map((campus) => (
            <li key={campus.id}>
              <button
                onClick={() => setSelectedCampusId(campus.id)}
                className={`w-full flex items-center justify-between px-3 py-3 text-left transition-colors ${
                  activeCampusId === campus.id
                    ? 'bg-(--theme-main)/10 text-(--theme-main)'
                    : 'hover:bg-(--surface-soft) text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">
                      {campus.campusName.replace(' Campus', '')}
                    </p>
                    <p className="text-xs text-(--muted)">
                      {(locationsByCampus[campus.id] || []).length} locations
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-3 h-3 shrink-0 ml-1 transition-transform ${
                    activeCampusId === campus.id ? 'rotate-90' : ''
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Location Content */}
      <div className="flex-1 min-w-0">
        {selectedCampus ? (
          <>
            {/* Campus Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{selectedCampus.campusName}</h2>
              <CustomButton
                text="Create Location"
                icon={Plus}
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
              />
            </div>

            {/* Locations List */}
            {selectedLocations.length > 0 ? (
              <div className="border border-(--border) rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto] px-4 py-2 bg-(--surface-soft) border-b border-(--border)">
                  <span className="text-xs font-semibold text-(--muted) uppercase tracking-wide">Location</span>
                  <span className="text-xs font-semibold text-(--muted) uppercase tracking-wide text-right pr-6">Type</span>
                  <span />
                </div>
                <ul className="divide-y divide-(--border)">
                  {selectedLocations.map((location) => (
                    <li key={location.id} className="grid grid-cols-[1fr_auto_auto] items-center px-4 py-3 hover:bg-(--surface-soft) transition-colors">
                      <span className="text-sm text-foreground">{location.name}</span>
                      <span className="text-sm font-medium text-(--theme-main) text-right pr-6">{location.type}</span>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, locationId: location.id })}
                        className="p-1 rounded hover:bg-red-50 text-(--muted) hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-(--muted)">
                <Building2 className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No locations found for this campus</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-16 text-(--muted)">
            <Building2 className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Select a campus to view its locations</p>
          </div>
        )}
      </div>
    </div>
  );
}