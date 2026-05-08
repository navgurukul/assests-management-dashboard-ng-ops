import { input } from '@nextui-org/react';
import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Field definitions ─────────────────────────────────────────────────────

/**
 * Edit-profile modal fields.
 * Pass `defaultValues` from current user data to pre-populate the form.
 *
 * @param {{ phone?: string; location?: string; campusId?: string }} defaultValues
 */
export const getEditProfileFields = (defaultValues = {}) => [
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: 'Enter 10-digit phone number',
    required: false,
    defaultValue: defaultValues.phone || '',
    maxLength: 10,
    inputMode: 'numeric',
    allowOnlyDigits: true,
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'Enter location',
    required: false,
    defaultValue: defaultValues.location || '',
  },
  {
    name: 'campusId',
    label: 'Campus (Only for students)',
    type: 'api-autocomplete',
    placeholder: 'Search and select campus',
    apiUrl: baseUrl + '/campuses',
    queryKey: ['campuses'],
    labelKey: 'campusName',
    valueKey: 'id',
    required: false,
    defaultValue: defaultValues.campusId || '',
  },
  {
    name: 'schoolId',
    label: 'School (Only for students)',
    type: 'select',
    placeholder: 'Select school',
    required: false,
    // hint: 'Only for students',
    options: [],
    defaultValue: defaultValues.schoolId || '',
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const editProfileValidationSchema = Yup.object().shape({
  phone: Yup.string()
    .nullable()
    .matches(
      /^[0-9]{10}$/,
      'Phone number must be exactly 10 digits'
    ),
  location: Yup.string()
    .nullable()
    .min(2, 'Location must be at least 2 characters'),
  campusId: Yup.string().nullable(),
  schoolId: Yup.string().nullable(),
});

// ─── Initial values ────────────────────────────────────────────────────────

export const editProfileInitialValues = {
  phone: '',
  location: '',
  campusId: '',
  schoolId: '',
};
