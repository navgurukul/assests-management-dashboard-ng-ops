'use client';

import React from 'react';
import GenericModalWrapper from './GenericModalWrapper';
import { componentInstallModalConfig, componentStripModalConfig } from '@/dummyJson/dummyJson';

/**
 * ComponentActionModal Component
 * Specialized modal for component actions (install or strip)
 * Uses the generic modal wrapper with component action configuration
 * 
 * Props:
 * - isOpen: Boolean
 * - onClose: Function
 * - onAction: Function - called with (formValues)
 * - action: 'install' | 'strip' - determines which config to use
 */
const ComponentActionModal = ({
  isOpen = false,
  onClose = () => {},
  onAction = () => {},
  action = 'install', // 'install' or 'strip'
}) => {
  // Select the appropriate config based on action type
  const config = action === 'install' ? componentInstallModalConfig : componentStripModalConfig;

  const handleAction = (actionId, formValues) => {
    const primaryActions = {
      'install': 'install',
      'confirm_removal': 'confirm_removal',
    };

    if (primaryActions[actionId]) {
      console.log(`Component ${action} action:`, formValues);
      onAction(formValues);
      onClose();
    } else if (actionId === 'cancel') {
      onClose();
    }
  };

  return (
    <GenericModalWrapper
      config={config}
      isOpen={isOpen}
      onClose={onClose}
      onAction={handleAction}
      maxWidth="max-w-lg"
    />
  );
};

export default ComponentActionModal;
