'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Edit, Trash2, Plus, Mail, Phone } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import FormModal from '@/components/molecules/FormModal';
import StateHandler from '@/components/atoms/StateHandler';
import useFetch from '@/app/hooks/query/useFetch';
import usePost from '@/app/hooks/query/usePost';
import usePatch from '@/app/hooks/query/usePatch';
import config from '@/app/config/env.config';
import { toast } from '@/app/utils/toast';
import { campusInchargeColumns } from '@/dummyJson/dummyJson';
import {
  campusInchargeModalFields,
  campusInchargeValidationSchema,
} from '@/app/config/formConfigs/campusInchargeModalConfig';


export default function CampusInchargeTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: apiResponse, isLoading, isError, error } = useFetch({
    url: config.endpoints.campusIncharge.list,
    queryKey: ['campus-incharge'],
  });

  const { mutateAsync: createCampusIncharge, isPending: isSubmitting } = usePost({
    onSuccess: () => {
      toast.success('Campus Incharge created successfully');
      queryClient.invalidateQueries({ queryKey: ['campus-incharge'] });
      setIsCreateModalOpen(false);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to create Campus Incharge');
    },
  });

  const { mutateAsync: updateCampusIncharge, isPending: isEditSubmitting } = usePatch({
    onSuccess: () => {
      toast.success('Campus Incharge updated successfully');
      queryClient.invalidateQueries({ queryKey: ['campus-incharge'] });
      setIsEditModalOpen(false);
      setSelectedItem(null);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update Campus Incharge');
    },
  });

  const campusInchargeData = useMemo(() => {
    const records = apiResponse?.data ?? [];
    return records.map((item) => ({
      ...item,
      campusObject: item.campus,
      campus: item.campusName,
    }));
  }, [apiResponse]);

  const editFields = useMemo(() => {
    if (!selectedItem) return campusInchargeModalFields;
    return campusInchargeModalFields.map((field) => {
      const valueMap = {
        campus: selectedItem.campusName,
        address: selectedItem?.campusObject?.address,
        state: selectedItem?.campusObject?.state,
        campusCode: selectedItem?.campusObject?.campusCode,
        capacity: selectedItem.capacity,
        school: Array.isArray(selectedItem.school) ? selectedItem.school : selectedItem.school ? [selectedItem.school] : [],
        itCoordinatorName: selectedItem.itCoordinator?.name,
        itCoordinatorEmail: selectedItem.itCoordinator?.email,
        itCoordinatorPhone: selectedItem.itCoordinator?.phone,
        operationName: selectedItem.operation?.name,
        operationEmail: selectedItem.operation?.email,
        operationPhone: selectedItem.operation?.phone,
        itLeadName: selectedItem.itLead?.name,
        itLeadEmail: selectedItem.itLead?.email,
        itLeadPhone: selectedItem.itLead?.phone,
      };

      const emailSelectedItemMap = {
        itCoordinatorEmail: selectedItem.itCoordinator?.email
          ? { email: selectedItem.itCoordinator.email }
          : null,
        operationEmail: selectedItem.operation?.email
          ? { email: selectedItem.operation.email }
          : null,
        itLeadEmail: selectedItem.itLead?.email
          ? { email: selectedItem.itLead.email }
          : null,
      };

      // Disable Campus, Address, and State fields in edit mode
      let disabled = false;
      if (["campus", "address", "state", "campusCode"].includes(field.name)) {
        disabled = true;
      }

      const extraProps = emailSelectedItemMap[field.name]
        ? { selectedItem: emailSelectedItemMap[field.name] }
        : {};

      return { ...field, defaultValue: valueMap[field.name] ?? '', disabled, ...extraProps };
    });
  }, [selectedItem]);

  const handleCreateSubmit = async (formData) => {
    const payload = {
      campusName: formData.campus,
      campusCode: formData.campusCode,
      address: formData.address,
      state: formData.state,
      capacity: Number(formData.capacity),
      school: formData.school,
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
              className="p-2 text-[var(--theme-main)] hover:bg-[var(--surface-soft)] rounded-lg transition-all duration-150 hover:scale-110"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(item);
              }}
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        );
      default:
        return item[columnKey];
    }
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (formData) => {
    const id = selectedItem?.id;
    const payload = {
      campusName: formData.campus,
      campusCode: formData.campusCode,
      address: formData.address,
      state: formData.state,
      capacity: Number(formData.capacity),
      school: formData.school,
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
    await updateCampusIncharge({
      endpoint: config.endpoints.campusIncharge.update(id),
      body: payload,
    });
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  if (isLoading || isError) {
    return <StateHandler isLoading={isLoading} isError={isError} error={error} />;
  }

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
        margin="m-0"
        shadow="shadow-none"
      />

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        componentName="Campus Incharge"
        actionType="Create"
        fields={campusInchargeModalFields}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
        size="large"
        validationSchema={campusInchargeValidationSchema}
      />

      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedItem(null); }}
        componentName="Campus Incharge"
        actionType="Edit"
        fields={editFields}
        onSubmit={handleEditSubmit}
        isSubmitting={isEditSubmitting}
        size="large"
        validationSchema={campusInchargeValidationSchema}
      />
    </div>
  );
}