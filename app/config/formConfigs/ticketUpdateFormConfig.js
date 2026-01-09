import * as Yup from 'yup';

export const ticketUpdateFormFields = [
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'Select ticket status',
    required: false,
    options: [
      { value: 'OPEN', label: 'Open' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
      { value: 'RESOLVED', label: 'Resolved' },
      { value: 'CLOSED', label: 'Closed' },
      { value: 'ESCALATED', label: 'Escalated' },
    ],
  },
  {
    name: 'assigneeUserId',
    label: 'Assign To',
    type: 'api-autocomplete',
    placeholder: 'Search and select user',
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL + '/users',
    queryKey: ['users'],
    labelKey: 'firstName',
    valueKey: 'id',
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
];

export const ticketUpdateValidationSchema = Yup.object().shape({
  status: Yup.string(),
  assigneeUserId: Yup.string(),
  description: Yup.string().max(500, 'Description must not exceed 500 characters'),
  resolutionNotes: Yup.string().max(1000, 'Resolution notes must not exceed 1000 characters'),
});
