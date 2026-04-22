import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asset-dashboard.navgurukul.org/api';

// ─── Field definitions ─────────────────────────────────────────────────────

export const campusInchargeModalFields = [
  // Campus
  {
    name: 'campus',
    label: 'Campus',
    type: 'text',
    placeholder: 'Enter campus name',
    required: true,
  },
  {
    name: 'address',
    label: 'Address',
    type: 'text',
    placeholder: 'e.g. 123 Main Street, City',
    required: true,
  },
  {
    name: 'state',
    label: 'State',
    type: 'api-autocomplete',
    rowWith: 'campusCode',
    placeholder: 'Search state...',
    required: true,
    labelKey: 'label',
    valueKey: 'value',
    staticItems: [
      { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
      { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
      { value: 'Assam', label: 'Assam' },
      { value: 'Bihar', label: 'Bihar' },
      { value: 'Chhattisgarh', label: 'Chhattisgarh' },
      { value: 'Goa', label: 'Goa' },
      { value: 'Gujarat', label: 'Gujarat' },
      { value: 'Haryana', label: 'Haryana' },
      { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
      { value: 'Jharkhand', label: 'Jharkhand' },
      { value: 'Karnataka', label: 'Karnataka' },
      { value: 'Kerala', label: 'Kerala' },
      { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
      { value: 'Maharashtra', label: 'Maharashtra' },
      { value: 'Manipur', label: 'Manipur' },
      { value: 'Meghalaya', label: 'Meghalaya' },
      { value: 'Mizoram', label: 'Mizoram' },
      { value: 'Nagaland', label: 'Nagaland' },
      { value: 'Odisha', label: 'Odisha' },
      { value: 'Punjab', label: 'Punjab' },
      { value: 'Rajasthan', label: 'Rajasthan' },
      { value: 'Sikkim', label: 'Sikkim' },
      { value: 'Tamil Nadu', label: 'Tamil Nadu' },
      { value: 'Telangana', label: 'Telangana' },
      { value: 'Tripura', label: 'Tripura' },
      { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
      { value: 'Uttarakhand', label: 'Uttarakhand' },
      { value: 'West Bengal', label: 'West Bengal' },
      { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
      { value: 'Chandigarh', label: 'Chandigarh' },
      { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra & Nagar Haveli and Daman & Diu' },
      { value: 'Delhi', label: 'Delhi' },
      { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
      { value: 'Ladakh', label: 'Ladakh' },
      { value: 'Lakshadweep', label: 'Lakshadweep' },
      { value: 'Puducherry', label: 'Puducherry' },
    ],
  },
  {
    name: 'campusCode',
    label: 'Campus Code',
    type: 'text',
    placeholder: 'e.g. BLR or PUN',
    required: true,
    pairedWith: true,
  },
  {
    name: 'capacity',
    label: 'Capacity',
    type: 'number',
    placeholder: 'Enter capacity (1 - 99999)',
    required: true,
    min: 1,
    max: 99999,
    rowWith: 'school',
  },
  {
    name: 'school',
    label: 'School',
    type: 'multi-select',
    placeholder: 'Select school',
    required: true,
    pairedWith: true,
    options: [
      { value: 'School of Programming', label: 'School of Programming' },
      { value: 'School Of Business', label: 'School Of Business' },
      { value: 'School of Finance', label: 'School of Finance' },
      { value: 'School of Second Chance', label: 'School of Second Chance' },
      { value: 'School of Data analytics', label: 'School of Data analytics' },
    ],
  },
  {
    name: 'itCoordinatorEmail',
    label: 'IT Coordinator Email',
    type: 'api-autocomplete',
    placeholder: 'Search by email...',
    required: true,
    apiUrl: `${baseUrl}/users`,
    queryKey: ['users-for-campus-incharge'],
    labelKey: 'email',
    valueKey: 'email',
    formatLabel: (item) => {
      const name = [item.firstName, item.lastName].filter(Boolean).join(' ') || item.username || '';
      return name ? `${item.email} — ${name}` : item.email;
    },
    companionFields: [
      {
        field: 'itCoordinatorName',
        compute: (item) => [item.firstName, item.lastName].filter(Boolean).join(' ') || item.username || '',
      },
      { field: 'itCoordinatorPhone', key: 'phone' },
    ],
  },
  {
    name: 'itCoordinatorName',
    label: 'IT Coordinator Name',
    type: 'text',
    placeholder: 'Full name',
    required: true,
    rowWith: 'itCoordinatorPhone',
  },
  {
    name: 'itCoordinatorPhone',
    label: 'IT Coordinator Phone',
    type: 'text',
    placeholder: '+91 XXXXX XXXXX',
    required: true,
    pairedWith: true,
  },

  {
    name: 'operationEmail',
    label: 'Operation Email',
    type: 'api-autocomplete',
    placeholder: 'Search by email...',
    required: true,
    apiUrl: `${baseUrl}/users`,
    queryKey: ['users-for-campus-incharge'],
    labelKey: 'email',
    valueKey: 'email',
    formatLabel: (item) => {
      const name = [item.firstName, item.lastName].filter(Boolean).join(' ') || item.username || '';
      return name ? `${item.email} — ${name}` : item.email;
    },
    companionFields: [
      {
        field: 'operationName',
        compute: (item) => [item.firstName, item.lastName].filter(Boolean).join(' ') || item.username || '',
      },
      { field: 'operationPhone', key: 'phone' },
    ],
  },
  {
    name: 'operationName',
    label: 'Operation Name',
    type: 'text',
    placeholder: 'Full name',
    required: true,
    rowWith: 'operationPhone',
  },
  {
    name: 'operationPhone',
    label: 'Operation Phone',
    type: 'text',
    placeholder: '+91 XXXXX XXXXX',
    required: true,
    pairedWith: true,
  },

  // IT Lead
  {
    name: 'itLeadEmail',
    label: 'IT Lead Email',
    type: 'api-autocomplete',
    placeholder: 'Search by email...',
    required: true,
    apiUrl: `${baseUrl}/users`,
    queryKey: ['users-for-campus-incharge'],
    labelKey: 'email',
    valueKey: 'email',
    formatLabel: (item) => {
      const name = [item.firstName, item.lastName].filter(Boolean).join(' ') || item.username || '';
      return name ? `${item.email} — ${name}` : item.email;
    },
    companionFields: [
      {
        field: 'itLeadName',
        compute: (item) => [item.firstName, item.lastName].filter(Boolean).join(' ') || item.username || '',
      },
      { field: 'itLeadPhone', key: 'phone' },
    ],
  },
  {
    name: 'itLeadName',
    label: 'IT Lead Name',
    type: 'text',
    placeholder: 'Full name',
    required: true,
    rowWith: 'itLeadPhone',
  },
  {
    name: 'itLeadPhone',
    label: 'IT Lead Phone',
    type: 'text',
    placeholder: '+91 XXXXX XXXXX',
    required: true,
    pairedWith: true,
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

const nameSchema = (label) =>
  Yup.string()
    .required(`${label} is required`)
    .min(2, `${label} must be at least 2 characters`);

const emailSchema = (label) =>
  Yup.string()
    .required(`${label} is required`)
    .email(`${label} must be a valid email`);

const phoneSchema = (label) =>
  Yup.string()
    .required(`${label} is required`)
    .matches(/^[0-9+\s\-()?]{7,20}$/, `${label}: enter a valid phone number`);

export const campusInchargeValidationSchema = Yup.object().shape({
  campus: Yup.string()
    .required('Campus name is required')
    .min(2, 'Campus name must be at least 2 characters'),

  address: Yup.string().required('Address is required'),

  state: Yup.string().required('State is required'),

  campusCode: Yup.string().required('Campus Code is required'),

  capacity: Yup.number()
    .typeError('Capacity must be a number')
    .required('Capacity is required')
    .min(1, 'Capacity must be at least 1')
    .max(99999, 'Capacity must be at most 99999'),

  school: Yup.array().of(Yup.string()).min(1, 'At least one school is required').required('School is required'),

  itCoordinatorName: nameSchema('IT Coordinator Name'),
  itCoordinatorEmail: emailSchema('IT Coordinator Email'),
  itCoordinatorPhone: phoneSchema('IT Coordinator Phone'),

  operationName: nameSchema('Operation Name'),
  operationEmail: emailSchema('Operation Email'),
  operationPhone: phoneSchema('Operation Phone'),

  itLeadName: nameSchema('IT Lead Name'),
  itLeadEmail: emailSchema('IT Lead Email'),
  itLeadPhone: phoneSchema('IT Lead Phone'),
});

// ─── Initial values ────────────────────────────────────────────────────────

export const campusInchargeInitialValues = {
  campus: '',
  address: '',
  state: '',
  campusCode: '',
  capacity: '',
  school: [],
  itCoordinatorName: '',
  itCoordinatorEmail: '',
  itCoordinatorPhone: '',
  operationName: '',
  operationEmail: '',
  operationPhone: '',
  itLeadName: '',
  itLeadEmail: '',
  itLeadPhone: '',
};