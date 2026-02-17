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
    type: 'select',
    placeholder: 'Select manager email',
    required: true,
    options: [
      { value: 'john.smith@company.com', label: 'John Smith - john.smith@company.com' },
      { value: 'sarah.johnson@company.com', label: 'Sarah Johnson - sarah.johnson@company.com' },
      { value: 'michael.brown@company.com', label: 'Michael Brown - michael.brown@company.com' },
      { value: 'emily.davis@company.com', label: 'Emily Davis - emily.davis@company.com' },
    ],
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
    placeholder: 'Describe the issue or request in detail...',
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
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  address: Yup.string().max(200, 'Address must not exceed 200 characters'),
  managerEmail: Yup.string()
    .required('Manager email is required')
    .email('Must be a valid email address'),
});

export const ticketInitialValues = {
  ticketType: '',
  assetId: '',
  priority: '',
  address: '',
  description: '',
  managerEmail: '',
};
