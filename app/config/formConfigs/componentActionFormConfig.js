

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const assetTypesApiUrl = '/asset-types';
const assetsApiUrl = '/assets';

// Function to build install/uninstall fields with component data
export const getInstallUninstallFields = (componentData = null) => {
  return [
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
      type: 'api-autocomplete',
      placeholder: 'Search and select device',
      apiUrl: assetsApiUrl,
      queryKey: ['assets'],
      labelKey: 'assetTag',
      valueKey: 'id',
      required: true,
      dependsOn: {
        field: 'assetTypeId',
        paramKey: 'type',
      },
      buildAdditionalParams: (formData, componentData) => {
        const params = {};
        // Get campusId from componentData
        if (componentData?.campus?.id) {
          params.campusId = componentData.campus.id;
        }
        return Object.keys(params).length > 0 ? params : null;
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
};


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

// Legacy export for backward compatibility
export const installUninstallFields = getInstallUninstallFields();

export const getFieldsByActionType = (actionType, componentData = null) => {
  if (!actionType) return [];
  
  const upperActionType = actionType.toUpperCase();
  switch (upperActionType) {
    case 'INSTALL':
    case 'UNINSTALL':
      return getInstallUninstallFields(componentData);
    case 'SCRAP':
      return scrapFields;
    case 'LOST':
      return lostFields;
    default:
      return [];
  }
};
