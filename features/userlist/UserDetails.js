'use client';

import React, { useState } from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import FormModal from '@/components/molecules/FormModal';
import post from '@/app/api/post/post';
import { toast } from '@/app/utils/toast';
import config from '@/app/config/env.config';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'RESIDENTIAL_TEAM', label: 'Residential Team' },
  { value: 'STUDENT', label: 'Student' },
];

export default function UserDetails({ userId, userData, onBack }) {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleChanging, setRoleChanging] = useState(false);

  const handleChangeRole = async (formData) => {
    setRoleChanging(true);
    try {
      await post({
        url: config.getApiUrl(config.endpoints.users.changeRole(userId)),
        method: 'PATCH',
        data: { role: formData.role },
      });
      toast.success('Role updated successfully');
      setRoleModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to update role');
    } finally {
      setRoleChanging(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">User data not available</p>
          <p className="text-gray-600 mt-2">Please navigate from the user list</p>
        </div>
      </div>
    );
  }

  const formatRole = (role) => {
    if (!role) return 'N/A';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-600';
      case 'STAFF':
        return 'text-blue-600';
      case 'STUDENT':
        return 'text-green-600';
      case 'MENTOR':
        return 'text-purple-600';
      default:
        return 'text-gray-900';
    }
  };

  const fullName =
    [userData.firstName, userData.lastName].filter(Boolean).join(' ') ||
    userData.username ||
    'N/A';

  // ─── Left column (30%) ─────────────────────────────────────────────────────
  const leftSections = [
    {
      title: 'Quick Info',
      items: [
        {
          label: 'Role',
          value: formatRole(userData.role),
          className: `font-semibold ${getRoleColor(userData.role)}`,
        },
        {
          label: 'Status',
          value: userData.isActive ? 'Active' : 'Inactive',
          className: userData.isActive
            ? 'font-semibold text-green-600'
            : 'font-semibold text-red-600',
        },
        { label: 'Campus', value: userData.campusId || userData.campus?.name || 'N/A' },
        { label: 'Department', value: userData.department || 'N/A' },
        { label: 'Location', value: userData.location || 'N/A' },
      ],
    },
    {
      title: 'Contact',
      items: [
        { label: 'Email', value: userData.email || 'N/A' },
        { label: 'Phone', value: userData.phone || 'N/A' },
      ],
    },
  ];

  // ─── Right column (70%) ────────────────────────────────────────────────────
  const rightSections = [
    {
      title: 'Personal Information',
      itemsGrid: true,
      items: [
        { label: 'First Name', value: userData.firstName || 'N/A' },
        { label: 'Last Name', value: userData.lastName || 'N/A' },
        { label: 'Username', value: userData.username || 'N/A' },
        { label: 'Email', value: userData.email || 'N/A' },
        { label: 'Phone', value: userData.phone || 'N/A' },
      ],
    },
    {
      title: 'Role & Access',
      itemsGrid: true,
      items: [
        {
          label: 'Role',
          value: formatRole(userData.role),
          className: `font-semibold ${getRoleColor(userData.role)}`,
        },
        {
          label: 'Account Status',
          value: userData.isActive ? 'Active' : 'Inactive',
          className: userData.isActive
            ? 'font-semibold text-green-600'
            : 'font-semibold text-red-600',
        },
        { label: 'Department', value: userData.department || 'N/A' },
      ],
    },
    {
      title: 'Campus & Location',
      itemsGrid: true,
      items: [
        { label: 'Campus', value: userData.campusId || userData.campus?.name || 'N/A' },
        { label: 'Location', value: userData.location || 'N/A' },
      ],
    },
    {
      title: 'System Information',
      itemsGrid: true,
      items: [
        { label: 'User ID', value: userData.id || 'N/A', className: 'col-span-2' },
        {
          label: 'Created At',
          value: userData.createdAt
            ? new Date(userData.createdAt).toLocaleString()
            : 'N/A',
        },
        {
          label: 'Updated At',
          value: userData.updatedAt
            ? new Date(userData.updatedAt).toLocaleString()
            : 'N/A',
        },
      ],
    },
  ];

  return (
    <>
      <DetailsPage
        title={`USER: ${fullName}`}
        subtitle={`Role: ${formatRole(userData.role)} | Status: ${userData.isActive ? 'Active' : 'Inactive'}`}
        subtitleColor={getRoleColor(userData.role)}
        leftSections={leftSections}
        rightSections={rightSections}
        showTimeline={false}
        onBack={onBack}
        headerActions={
          <button
            onClick={() => setRoleModalOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Change Role
          </button>
        }
      />

      <FormModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        actionType="Change Role"
        helpText={`Current role: ${formatRole(userData.role)}`}
        fields={[
          {
            name: 'role',
            label: 'New Role',
            type: 'select',
            required: true,
            placeholder: 'Select a role',
            options: ROLE_OPTIONS,
          },
        ]}
        onSubmit={handleChangeRole}
        isSubmitting={roleChanging}
        size="small"
      />
    </>
  );
}
