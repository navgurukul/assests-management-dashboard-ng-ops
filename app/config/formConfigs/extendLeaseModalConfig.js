import * as Yup from 'yup';

// ─── Options ──────────────────────────────────────────────────────────────

export const LEASE_TYPE_OPTIONS = [
  { label: 'Bond', value: 'BOND' },
  { label: 'Deposit', value: 'DEPOSIT' },
];

// ─── Field definitions ─────────────────────────────────────────────────────

export const extendLeaseFields = [
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
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Reason for extending lease...',
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const extendLeaseValidationSchema = Yup.object().shape({
  leaseType: Yup.string()
    .required('Lease type is required')
    .oneOf(
      LEASE_TYPE_OPTIONS.map((o) => o.value),
      'Invalid lease type'
    ),
  extendUntil: Yup.date()
    .required('Extension date is required')
    .min(new Date(), 'Extension date must be in the future'),
  description: Yup.string().nullable(),
});

// ─── Initial values ────────────────────────────────────────────────────────

export const extendLeaseInitialValues = {
  leaseType: '',
  extendUntil: '',
  description: '',
};
