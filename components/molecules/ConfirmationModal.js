'use client';

import React from 'react';
import Modal from '@/components/molecules/Modal';
import CustomButton from '@/components/atoms/CustomButton';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to perform this action?', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isLoading = false 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="py-2">
        <p className="text-gray-700 text-sm">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <CustomButton 
            text={cancelText}
            variant="neutral" 
            onClick={onClose}
            disabled={isLoading}
          />
          <CustomButton 
            text={confirmText}
            variant="danger" 
            onClick={onConfirm}
            disabled={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
}