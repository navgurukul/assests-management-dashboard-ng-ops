import * as Yup from 'yup';

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
    label: 'Manager Comment',
    type: 'textarea',
    placeholder: 'Add resolution notes...',
    required: false,
    rows: 4,
    disabled: true,
  },
  {
    name: 'adminComment',
    label: 'Comment',
    type: 'textarea',
    placeholder: 'Add comment...',
    required: false,
    rows: 3,
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
  ticketUpdateReadOnlyFields[0], // status
  ticketUpdateEditableFields[2], // timelineDate (Expected Resolution Date) — placed next to Status
  ticketUpdateReadOnlyFields[1], // description
  ticketUpdateEditableFields[0], // resolutionNotes
  ticketUpdateEditableFields[1], // adminComment
];

export const ticketUpdateValidationSchema = Yup.object().shape({
  status: Yup.string(),
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
  adminComment: Yup.string()
    .max(1000, 'Admin comment must not exceed 1000 characters'),
});
