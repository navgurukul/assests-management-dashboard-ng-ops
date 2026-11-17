import * as Yup from 'yup';

// ─── Options ──────────────────────────────────────────────────────────────

export const LEASE_TYPE_OPTIONS = [
  { label: 'Bond', value: 'BOND' },
  { label: 'Deposit', value: 'DEPOSIT' },
];

const MAX_EXTENSION_DAYS = 90;

// Earliest selectable date is tomorrow; today is not allowed.
const getDateBounds = () => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + MAX_EXTENSION_DAYS);
  maxDate.setHours(23, 59, 59, 999);

  return { minDate, maxDate };
};

// ─── Field definitions ─────────────────────────────────────────────────────

export const getExtendLeaseFields = (assetTagDisplay = '', campusDisplay = '', campusManagerDisplay = '') => {
  const { minDate, maxDate } = getDateBounds();

  return [
    {
      name: 'assetTagDisplay',
      label: 'Asset Tag',
      type: 'text',
      defaultValue: assetTagDisplay,
      disabled: true,
      readOnly: true,
    },
    {
      name: 'campusDisplay',
      label: 'Asset Campus',
      type: 'text',
      defaultValue: campusDisplay,
      disabled: true,
      readOnly: true,
    },
    {
      name: 'campusManagerDisplay',
      label: 'Campus Manager',
      type: 'text',
      defaultValue: campusManagerDisplay,
      disabled: true,
      readOnly: true,
      helpText: `This lease request will be sent to ${campusManagerDisplay} for approval.`,
    },
    {
      name: 'leaseType',
      label: 'Lease Type',
      type: 'radio',
      required: true,
      options: LEASE_TYPE_OPTIONS,
    },
    {
      name: 'extendUntil',
      label: 'Extend Until',
      type: 'date',
      required: true,
      placeholder: 'Select date',
      helpText: 'Select an extension end date (maximum 3 months)',
      minDate,
      maxDate,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Reason for extending lease...',
    },
    {
      name: 'supportedDocument',
      label: 'Supporting Document',
      type: 'file',
      required: false,
      accept: '.pdf,.jpg,.jpeg,.png',
      helpText: 'Upload bond/lease related document (PDF or image).',
      fullWidth: true,
    },
  ];
};

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const getExtendLeaseValidationSchema = () => {
  const { minDate, maxDate } = getDateBounds();

  return Yup.object().shape({
    leaseType: Yup.string()
      .required('Lease type is required')
      .oneOf(
        LEASE_TYPE_OPTIONS.map((o) => o.value),
        'Invalid lease type'
      ),
    extendUntil: Yup.date()
      .typeError('Please select a valid date')
      .required('Extension date is required')
      .min(minDate, 'Extension date must be in the future')
      .max(maxDate, 'Extension date cannot be more than 90 days from today'),
    description: Yup.string().nullable(),
    supportedDocument: Yup.mixed().nullable(),
  });
};

// ─── Initial values ────────────────────────────────────────────────────────

export const extendLeaseInitialValues = {
  leaseType: '',
  extendUntil: '',
  description: '',
  supportedDocument: null,
};
