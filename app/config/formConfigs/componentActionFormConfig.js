

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const assetTypesApiUrl = '/asset-types';

export const installUninstallFields = [
  {
    name: 'assetTypeId',
    label: 'Asset Type',
    type: 'api-autocomplete',
    placeholder: 'Search and select asset type',
    apiUrl: assetTypesApiUrl,
    queryKey: ['asset-types'],
    labelKey: 'name',
    valueKey: 'id',
    filterCategory: 'DEVICE',
    required: true,
  },
  {
    name: 'deviceId',
    label: 'Device ID (NG-PN)',
    type: 'text',
    placeholder: 'Enter Device ID (e.g., NG-PN-001)',
    required: true,
    validation: (value) => {
      if (!value) return null;
      const ngPnPattern = /^NG-PN-\d+$/i;
      if (!ngPnPattern.test(value.trim())) {
        return 'Device ID must be in format: NG-PN-XXX';
      }
      return null;
    },
  },
  {
    name: 'person',
    label: 'Person (Logged in user)',
    type: 'text',
    placeholder: 'Enter person name',
    required: true,
    validation: (value) => {
      if (!value) return null;
      if (value.trim().length < 2) {
        return 'Person name must be at least 2 characters';
      }
      return null;
    },
  },
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    required: true,
    defaultValue: getTodayDate(),
    validation: (value) => {
      if (!value) return null;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        return 'Date cannot be in the future';
      }
      return null;
    },
  },
];


export const scrapFields = [
  {
    name: 'reason',
    label: 'Reason',
    type: 'textarea',
    placeholder: 'Enter reason for scrapping this component',
    required: true,
    rows: 4,
    validation: (value) => {
      if (!value) return null;
      if (value.trim().length < 10) {
        return 'Reason must be at least 10 characters';
      }
      if (value.trim().length > 500) {
        return 'Reason must not exceed 500 characters';
      }
      return null;
    },
  },
  {
    name: 'person',
    label: 'Person (Logged in user)',
    type: 'text',
    placeholder: 'Enter person name',
    required: true,
    validation: (value) => {
      if (!value) return null;
      if (value.trim().length < 2) {
        return 'Person name must be at least 2 characters';
      }
      return null;
    },
  },
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    required: true,
    defaultValue: getTodayDate(),
    validation: (value) => {
      if (!value) return null;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        return 'Date cannot be in the future';
      }
      return null;
    },
  },
];

/**
 * Lost Action Fields
 */
export const lostFields = [
  {
    name: 'reason',
    label: 'Reason',
    type: 'textarea',
    placeholder: 'Enter reason for marking this component as lost',
    required: true,
    rows: 4,
    validation: (value) => {
      if (!value) return null;
      if (value.trim().length < 10) {
        return 'Reason must be at least 10 characters';
      }
      if (value.trim().length > 500) {
        return 'Reason must not exceed 500 characters';
      }
      return null;
    },
  },
  {
    name: 'person',
    label: 'Person (Logged in user)',
    type: 'text',
    placeholder: 'Enter person name',
    required: true,
    validation: (value) => {
      if (!value) return null;
      if (value.trim().length < 2) {
        return 'Person name must be at least 2 characters';
      }
      return null;
    },
  },
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    required: true,
    defaultValue: getTodayDate(),
    validation: (value) => {
      if (!value) return null;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        return 'Date cannot be in the future';
      }
      return null;
    },
  },
];

export const getFieldsByActionType = (actionType) => {
  switch (actionType?.toUpperCase()) {
    case 'INSTALL':
    case 'UNINSTALL':
      return installUninstallFields;
    case 'SCRAP':
      return scrapFields;
    case 'LOST':
      return lostFields;
    default:
      return [];
  }
};
