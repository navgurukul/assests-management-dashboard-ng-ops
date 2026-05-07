import * as Yup from 'yup';

// ─── Field definitions ─────────────────────────────────────────────────────

export const createLocationFields = [
  {
    name: 'name',
    label: 'Location Name',
    type: 'text',
    placeholder: 'e.g. Almirah 1',
    required: true,
  },
  {
    name: 'type',
    label: 'Location Type',
    type: 'select',
    placeholder: 'Select location type',
    required: true,
    options: [
      { value: 'Almirah', label: 'Almirah' },
      { value: 'Storage Room', label: 'Storage Room' },
      { value: 'Rack', label: 'Rack' },
      { value: 'Scrap Bin', label: 'Scrap Bin' },
    ],
  },
  {
    name: 'capacity',
    label: 'Capacity',
    type: 'number',
    placeholder: 'Enter capacity',
    required: true,
    min: 1,
    max: 99999,
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const createLocationValidationSchema = Yup.object().shape({
  name: Yup.string().required('Location name is required').min(2, 'Must be at least 2 characters'),
  type: Yup.string().required('Location type is required'),
  capacity: Yup.number()
    .typeError('Capacity must be a number')
    .required('Capacity is required')
    .min(1, 'Capacity must be at least 1')
    .max(99999, 'Capacity cannot exceed 99999'),
});
