'use client';

import React from 'react';
import GenericModalWrapper from './GenericModalWrapper';
import { allocationModalConfig } from '@/dummyJson/dummyJson';

/**
 * AllocationModal Component
 * Specialized modal for asset allocation operations
 * Uses the generic modal wrapper with allocation-specific configuration
 */
const AllocationModal = ({ isOpen = false, onClose = () => {}, onConfirm = () => {} }) => {
  const handleAction = (actionId, formValues) => {
    if (actionId === 'confirm') {
      console.log('Allocation Confirmed:', formValues);
      onConfirm(formValues);
      onClose();
    } else if (actionId === 'cancel') {
      onClose();
    }
  };

  return (
    <GenericModalWrapper
      config={allocationModalConfig}
      isOpen={isOpen}
      onClose={onClose}
      onAction={handleAction}
      maxWidth="max-w-lg"
    />
  );
};

export default AllocationModal;
