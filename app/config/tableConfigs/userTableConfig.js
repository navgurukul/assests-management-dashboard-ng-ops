/**
 * User Table Column Configuration
 * Defines all available columns for the user list table with metadata
 */

export const USER_TABLE_ID = 'userlist';

// All available columns for the user list table
export const userTableColumns = [
  // Always visible columns
  {
    key: 'name',
    label: 'NAME',
    alwaysVisible: true,
    description: 'Full name of the user',
  },
  {
    key: 'email',
    label: 'EMAIL',
    alwaysVisible: true,
    description: 'Email address of the user',
  },

  // Default visible columns
  {
    key: 'role',
    label: 'ROLE',
    description: 'Role of the user (Student, Staff, etc.)',
  },
  {
    key: 'campus',
    label: 'USER CAMPUS',
    description: 'Campus the user belongs to',
  },
  {
    key: 'assetTag',
    label: 'ASSIGNED ASSET',
    description: 'Asset tag of the asset assigned to the user',
  },
  {
    key: 'assetType',
    label: 'ASSET TYPE',
    description: 'Type of the assigned asset',
  },
  {
    key: 'assetBrand',
    label: 'BRAND',
    description: 'Brand of the assigned asset',
  },
  {
    key: 'assetModel',
    label: 'MODEL',
    description: 'Model of the assigned asset',
  },
  {
    key: 'assetCondition',
    label: 'CONDITION',
    description: 'Physical condition of the assigned asset',
  },
  {
    key: 'assetCampus',
    label: 'ASSET CAMPUS',
    description: 'Campus from which the asset was dispatched',
  },
  {
    key: 'allocationDate',
    label: 'ALLOCATED ON',
    description: 'Date when the asset was assigned to the user',
  },
  {
    key: 'allocationStatus',
    label: 'ALLOCATION STATUS',
    description: 'Whether the allocation is currently active or returned',
  },

  // Optional columns
  {
    key: 'allocationReason',
    label: 'REASON',
    description: 'Reason for allocation (Joiner, Replacement, etc.)',
  },
  {
    key: 'returnDate',
    label: 'RETURN DATE',
    description: 'Date the asset was returned (if applicable)',
  },
  {
    key: 'assetSerialNumber',
    label: 'SERIAL NUMBER',
    description: 'Serial number of the assigned asset',
  },

  // Actions column - always visible
  {
    key: 'actions',
    label: 'ACTIONS',
    alwaysVisible: true,
    description: 'Available actions',
  },
];

// Default visible columns (shown on first visit or after reset)
export const defaultVisibleColumns = [
  'name',
  'email',
  'role',
  'campus',
  'assetTag',
  'assetType',
  'assetBrand',
  'assetModel',
  'assetCondition',
  'assetCampus',
  'allocationDate',
  'allocationStatus',
  'actions',
];
