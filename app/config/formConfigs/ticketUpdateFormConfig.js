import * as Yup from 'yup';
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Format label to show firstName + lastName
const formatCoordinatorLabel = (item) => {
  const firstName = item.firstName || '';
  const lastName = item.lastName || '';
  return `${firstName} ${lastName}`.trim();
};

export const ticketUpdateFormFields = [
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'Select ticket status',
    required: false,
    options: [
      { value: 'OPEN', label: 'Open' },
      { value: 'ALLOCATED', label: 'Allocated' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
      { value: 'OVERDUE', label: 'Overdue' },
      { value: 'RESOLVED', label: 'Resolved' },
      { value: 'CLOSED', label: 'Closed' },
      { value: 'ESCALATED', label: 'Escalated' },
    ],
    helperText: 'Status value must match backend allowed values. If ALLOCATED fails, ask backend team for correct value.',
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
    required: false,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Update the ticket description...',
    required: false,
    rows: 3,
  },
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
    placeholder: 'Select expected resolution date',
    required: false,
    helperText: 'SLA timeline - can only be set once during assignment.',
    disabled: false, // Will be set dynamically based on existing value
  },
];

export const ticketUpdateValidationSchema = Yup.object().shape({
  status: Yup.string(),
  assigneeUserId: Yup.string(),
  description: Yup.string().max(500, 'Description must not exceed 500 characters'),
  resolutionNotes: Yup.string().max(1000, 'Resolution notes must not exceed 1000 characters'),
  timelineDate: Yup.date()
    .nullable()
    .typeError('Expected Resolution Date must be a valid date')
    .min(new Date(), 'Expected Resolution Date must be today or later'),
});
