import * as Yup from 'yup';

export const allocationFormFields = [
  {
    name: 'assetId',
    label: 'Asset',
    type: 'text',
    placeholder: 'Enter asset ID or select from available assets',
    required: true,
  },
  {
    name: 'userId',
    label: 'Assign To User',
    type: 'text',
    placeholder: 'Enter user ID or search by name',
    required: true,
  },
  {
    name: 'startDate',
    label: 'Start Date',
    type: 'date',
    placeholder: 'Select allocation start date',
    required: true,
  },
  {
    name: 'endDate',
    label: 'End Date (Optional)',
    type: 'date',
    placeholder: 'Leave empty for active allocation',
    required: false,
  },
  {
    name: 'allocationReason',
    label: 'Allocation Reason',
    type: 'select',
    placeholder: 'Select reason for allocation',
    required: true,
    options: [
      { value: 'JOINER', label: 'Joiner (New Student/Staff)' },
      { value: 'REPAIR', label: 'Repair (Temporary Replacement)' },
      { value: 'REPLACEMENT', label: 'Replacement (Permanent Swap)' },
      { value: 'LOANER', label: 'Loaner (Temporary Device)' },
    ],
  },
  {
    name: 'isTemporary',
    label: 'Temporary Allocation',
    type: 'checkbox',
    required: false,
  },
  {
    name: 'expectedReturnDate',
    label: 'Expected Return Date',
    type: 'date',
    placeholder: 'For temporary allocations only',
    required: false,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Add any additional notes or comments about this allocation',
    required: false,
  },
];

export const allocationValidationSchema = Yup.object().shape({
  assetId: Yup.string().required('Asset is required'),
  userId: Yup.string().required('User is required'),
  startDate: Yup.date()
    .required('Start date is required')
    .max(new Date(), 'Start date cannot be in the future'),
  endDate: Yup.date()
    .nullable()
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  allocationReason: Yup.string()
    .required('Allocation reason is required')
    .oneOf(['JOINER', 'REPAIR', 'REPLACEMENT', 'LOANER'], 'Invalid allocation reason'),
  isTemporary: Yup.boolean(),
  expectedReturnDate: Yup.date()
    .nullable()
    .when('isTemporary', {
      is: true,
      then: (schema) => schema.required('Expected return date is required for temporary allocations'),
    }),
  notes: Yup.string(),
});

export const allocationInitialValues = {
  assetId: '',
  userId: '',
  startDate: new Date().toISOString().split('T')[0], // Today's date
  endDate: '',
  allocationReason: 'JOINER',
  isTemporary: false,
  expectedReturnDate: '',
  notes: '',
};

