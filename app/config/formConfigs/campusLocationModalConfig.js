import * as Yup from 'yup';

// ─── Field definitions ─────────────────────────────────────────────────────

export const createLocationFields = [
  {
    name: 'name',
    label: 'Location Name',
    type: 'text',
    placeholder: 'e.g. IT Room',
    required: true,
  },
  {
    name: 'type',
    label: 'Location Type',
    type: 'select',
    placeholder: 'Select location type',
    required: true,
    options: [
      { value: 'IT_ROOM', label: 'IT Room' },
      { value: 'STOREROOM', label: 'Store Room' },
      { value: 'LAB', label: 'Lab' },
      { value: 'OFFICE', label: 'Office' },
      { value: 'CLASSROOM', label: 'Classroom' },
      { value: 'ALMIRAH', label: 'Almirah' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const createLocationValidationSchema = Yup.object().shape({
  name: Yup.string().required('Location name is required').min(2, 'Must be at least 2 characters'),
  type: Yup.string().required('Location type is required'),
});