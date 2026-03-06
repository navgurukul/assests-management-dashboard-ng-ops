'use client';

import { useState } from 'react';
import { Building2, Edit, Trash2, Plus, Mail, Phone } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import FormModal from '@/components/molecules/FormModal';
import {
  campusInchargeFormFields,
  campusInchargeData,
  campusInchargeColumns,
} from '@/dummyJson/dummyJson';


export default function CampusInchargeTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // TODO: replace with actual API call
      console.log('Create Campus Incharge:', formData);
      setIsCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render person details (Name, Email, Phone)
  const renderPersonDetails = (person) => (
    <div className="space-y-1.5">
      <div className="font-semibold text-gray-900">{person.name}</div>
      <div className="text-gray-600 flex items-center gap-1.5 text-xs">
        <Mail className="w-3.5 h-3.5" />
        {person.email}
      </div>
      <div className="text-gray-600 flex items-center gap-1.5 text-xs">
        <Phone className="w-3.5 h-3.5" />
        {person.phone}
      </div>
    </div>
  );

  // Handle cell rendering
  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case 'campus':
        return <span className="font-bold text-gray-900 uppercase">{item.campus}</span>;
      case 'itCoordinator':
        return renderPersonDetails(item.itCoordinator);
      case 'operation':
        return renderPersonDetails(item.operation);
      case 'itLead':
        return renderPersonDetails(item.itLead);
      case 'actions':
        return (
          <div className="flex justify-center gap-3">
            <button
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-150 hover:scale-110"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                // Handle edit
              }}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-150 hover:scale-110"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                // Handle delete
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      default:
        return item[columnKey];
    }
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div>
      <TableWrapper
        data={campusInchargeData}
        columns={campusInchargeColumns}
        title="Campus Incharge"
        renderCell={renderCell}
        showPagination={false}
        ariaLabel="Campus Incharge table"
        showCreateButton={true}
        onCreateClick={handleCreateClick}
      />

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        componentName="Campus Incharge"
        actionType="Create"
        fields={campusInchargeFormFields}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
        size="large"
      />
    </div>
  );
}
