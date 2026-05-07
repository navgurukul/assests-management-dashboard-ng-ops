'use client';

import { useState } from 'react';
import { ChevronRight, Building2, Plus, Trash2 } from 'lucide-react';
import { campusLocationData } from '@/dummyJson/dummyJson';
import FormModal from '@/components/molecules/FormModal';
import CustomButton from '@/components/atoms/CustomButton';
import {
  createLocationFields,
  createLocationValidationSchema,
} from '@/app/config/formConfigs/campusLocationModalConfig';



export default function CampusLocationTab() {
  const [selectedCampusId, setSelectedCampusId] = useState(campusLocationData[0]?.id || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCampus = campusLocationData.find((campus) => campus.id === selectedCampusId);

  const handleCreateLocationSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // TODO: wire up API call here
      console.log('Create location payload:', { campusId: selectedCampusId, ...formData });
      setIsCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Campus Sidebar */}
      <div className="w-56 shrink-0 border border-(--border) rounded-lg overflow-hidden bg-(--surface)">
        <div className="px-3 py-2.5 border-b border-(--border) bg-(--surface-soft)">
          <p className="text-xs font-semibold text-(--muted) uppercase tracking-wide">Campuses</p>
        </div>
        <ul className="divide-y divide-(--border)">
          {campusLocationData.map((campus) => (
            <li key={campus.id}>
              <button
                onClick={() => setSelectedCampusId(campus.id)}
                className={`w-full flex items-center justify-between px-3 py-3 text-left transition-colors ${
                  selectedCampusId === campus.id
                    ? 'bg-(--theme-main)/10 text-(--theme-main)'
                    : 'hover:bg-(--surface-soft) text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{campus.campusName.replace(' Campus', '')}</p>
                    <p className="text-xs text-(--muted)">{campus.totalLocations} locations</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-3 h-3 shrink-0 ml-1 transition-transform ${
                    selectedCampusId === campus.id ? 'rotate-90' : ''
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
            <div className="border border-(--border) rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] px-4 py-2 bg-(--surface-soft) border-b border-(--border)">
                <span className="text-xs font-semibold text-(--muted) uppercase tracking-wide">Location</span>
                <span className="text-xs font-semibold text-(--muted) uppercase tracking-wide text-right pr-6">Count</span>
                <span />
              </div>
              <ul className="divide-y divide-(--border)">
                {selectedCampus.locations.map((location) => (
                  <li key={location.id} className="grid grid-cols-[1fr_auto_auto] items-center px-4 py-3 hover:bg-(--surface-soft) transition-colors">
                    <span className="text-sm text-foreground">{location.name}</span>
                    <span className="text-sm font-medium text-(--theme-main) text-right pr-6">{location.currentCount}</span>
                    <button
                      onClick={() => console.log('Delete location:', location.id)}
                      className="p-1 rounded hover:bg-red-50 text-(--muted) hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
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