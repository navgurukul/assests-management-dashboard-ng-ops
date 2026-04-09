import * as Yup from 'yup';

// ─── Options ──────────────────────────────────────────────────────────────

export const LEASE_TYPE_OPTIONS = [
  { label: 'Bond', value: 'BOND' },
  { label: 'Deposit', value: 'DEPOSIT' },
];

// ─── Field definitions ─────────────────────────────────────────────────────

export const getExtendLeaseFields = () => {
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  maxDate.setHours(23, 59, 59, 999);

  return [
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
  ];
};

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const getExtendLeaseValidationSchema = () => {
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  maxDate.setHours(23, 59, 59, 999);

  return Yup.object().shape({
    leaseType: Yup.string()
      .required('Lease type is required')
      .oneOf(
        LEASE_TYPE_OPTIONS.map((o) => o.value),
        'Invalid lease type'
      ),
    extendUntil: Yup.date()
      .required('Extension date is required')
      .min(minDate, 'Extension date must be in the future')
      .max(maxDate, 'Extension date cannot exceed 90 days from today'),
    description: Yup.string().nullable(),
  });
};

// ─── Initial values ────────────────────────────────────────────────────────

export const extendLeaseInitialValues = {
  leaseType: '',
  extendUntil: '',
  description: '',
};
