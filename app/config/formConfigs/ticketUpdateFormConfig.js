import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const formatCoordinatorLabel = (item) => {
  const firstName = item.firstName || '';
  const lastName = item.lastName || '';
  return `${firstName} ${lastName}`.trim();
};

export const ticketUpdateReadOnlyFields = [
  {
    name: 'status',
    label: 'Status',
    type: 'text',
    placeholder: 'Status',
    disabled: true,
    required: false,
  },
  {
    name: 'assigneeUserId',
    label: 'Assign To',
    type: 'api-autocomplete',
    placeholder: 'Search and select IT Coordinator',
    apiUrl: baseUrl + '/it-coordinators',
    queryKey: ['it-coordinators'],
    labelKey: 'firstName',
    valueKey: 'id',
    dataPath: 'data.users',
    formatLabel: formatCoordinatorLabel,
    disabled: true,
    required: false,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'No description provided.',
    disabled: true,
    required: false,
    rows: 3,
  },
];

export const ticketUpdateEditableFields = [
  {
    name: 'resolutionNotes',
    label: 'Resolution Notes',
    type: 'textarea',
    placeholder: 'Add resolution notes...',
    required: false,
    rows: 4,
  },
  {
    name: 'timelineDate',
    label: 'Expected Resolution Date',
    type: 'date',
    required: false,
    helperText: 'SLA timeline — can only be set once.',
  },
];

export const ticketUpdateFormFields = [
  ...ticketUpdateReadOnlyFields,
  ...ticketUpdateEditableFields,
];

export const ticketUpdateValidationSchema = Yup.object().shape({
  status: Yup.string(),
  assigneeUserId: Yup.string(),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters'),
  resolutionNotes: Yup.string()
    .max(1000, 'Resolution notes must not exceed 1000 characters'),
  timelineDate: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .typeError('Expected Resolution Date must be a valid date')
    .test(
      'min-today',
      'Expected Resolution Date must be today or later',
      (value) => {
        if (!value) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value >= today;
      }
    ),
});
