import * as Yup from 'yup';
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ticketFormFields = [
  {
    name: 'ticketType',
    label: 'Ticket Type',
    type: 'select',
    placeholder: 'Select ticket type',
    required: true,
    options: [
      { value: 'NEW', label: 'New' },
      { value: 'REPAIR', label: 'Repair' },
    ],
  },
  {
    name: 'assetId',
    label: 'Asset',
    type: 'api-autocomplete',
    placeholder: 'Search and select asset',
    apiUrl: baseUrl + '/allocations/my-assets',
    queryKey: ['myAssets'],
    labelKey: 'assetTag',
    valueKey: 'id',
    dataPath: 'data.assets',
    formatLabel: (asset) => {
      return asset?.assetTag || 'N/A';
    },
    companionField: 'campusId',
    companionKey: 'campusId',
    required: true,
    showIf: {
      field: 'ticketType',
      value: ['REPAIR'],
    },
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    placeholder: 'Select priority level',
    required: true,
    options: [
      { value: 'LOW', label: 'Low' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' },
    ],
  },
  {
    name: 'managerEmail',
    label: 'Manager Email',
    type: 'api-autocomplete',
    placeholder: 'Search by name or email',
    apiUrl: baseUrl + '/users',
    queryKey: ['managers'],
    labelKey: 'email',
    valueKey: 'email',
    dataPath: 'data',
    additionalParams: { role: 'MANAGER & ADMIN', limit: 1000 },
    formatLabel: (manager) => {
      const fullName = `${manager?.firstName || ''} ${manager?.lastName || ''}`.trim();
      return fullName ? `${fullName} - ${manager?.email}` : manager?.email;
    },
    helpText: "Search by name or email. Can't find your manager? Ask them to log in to the dashboard once, or contact IT/Admin.",
    emptyContent: "No manager found with that name/email. They may not have logged in yet, or their account role isn't set to Manager — ask them to log in once, or contact IT/Admin to update their role.",
    required: true,
  },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    placeholder: 'Enter address',
    required: false,
    showIf: {
      field: 'ticketType',
      value: ['NEW'],
    },
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe the issue or request in detail (at least 5 words)...',
    required: true,
    rows: 4,
  },
];

export const ticketValidationSchema = Yup.object().shape({
  ticketType: Yup.string().required('Ticket type is required'),
  assetId: Yup.string().when('ticketType', {
    is: (val) => val === 'REPAIR',
    then: (schema) => schema.required('Asset is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  priority: Yup.string().required('Priority is required'),
  description: Yup.string()
    .required('Description is required')
    .min(25, 'Description must be at least 25 characters')
    .max(250, 'Description must not exceed 250 characters'),
  address: Yup.string()
    .max(200, 'Address must not exceed 200 characters')
    .min(8, 'Address must be at least 8 characters')
    .test('word-count', 'Address must have at least 2 words', (value) => {
      if (!value) return true;
      return value.trim().split(/\s+/).length >= 2;
    }),
  managerEmail: Yup.string()
    .required('Manager email is required')
    .email('Must be a valid email address'),
});

export const ticketInitialValues = {
  ticketType: '',
  assetId: '',
  campusId: '',
  priority: '',
  address: '',
  description: '',
  managerEmail: '',
};