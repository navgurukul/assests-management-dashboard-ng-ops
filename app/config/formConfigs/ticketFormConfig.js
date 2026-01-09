import * as Yup from 'yup';

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
      { value: 'MAINTENANCE', label: 'Maintenance' },
      { value: 'REPLACEMENT', label: 'Replacement' },
    ],
  },
  {
    name: 'assetId',
    label: 'Asset',
    type: 'api-autocomplete',
    placeholder: 'Search and select asset',
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL + '/assets',
    queryKey: ['assets'],
    labelKey: 'assetTag',
    valueKey: 'id',
    required: true,
  },
  {
    name: 'campusId',
    label: 'Campus',
    type: 'api-autocomplete',
    placeholder: 'Search and select campus',
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL + '/campuses',
    queryKey: ['campuses'],
    labelKey: 'campusName',
    valueKey: 'id',
    required: true,
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
  assetId: Yup.string().required('Asset is required'),
  campusId: Yup.string().required('Campus is required'),
  priority: Yup.string().required('Priority is required'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
});

export const ticketInitialValues = {
  ticketType: '',
  assetId: '',
  campusId: '',
  priority: '',
  description: '',
};
