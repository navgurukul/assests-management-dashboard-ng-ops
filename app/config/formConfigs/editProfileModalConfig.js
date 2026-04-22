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
    placeholder: 'Enter phone number',
    required: false,
    defaultValue: defaultValues.phone || '',
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
    label: 'Campus',
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
    name: 'school',
    label: 'School',
    type: 'select',
    placeholder: 'Select school',
    required: false,
    hint: 'Only for students',
    options: [
      { value: 'School of Programming', label: 'School of Programming' },
      { value: 'School of Business', label: 'School of Business' },
      { value: 'School of Finance', label: 'School of Finance' },
      { value: 'School of Second Chance', label: 'School of Second Chance' },
      { value: 'School of Data Analytics', label: 'School of Data Analytics' },
    ],
    defaultValue: defaultValues.school || '',
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const editProfileValidationSchema = Yup.object().shape({
  phone: Yup.string()
    .nullable()
    .matches(
      /^[0-9+\s\-()?]{7,20}$/,
      'Enter a valid phone number (7-20 digits, may include +, -, spaces)'
    ),
  location: Yup.string()
    .nullable()
    .min(2, 'Location must be at least 2 characters'),
  campusId: Yup.string().nullable(),
  school: Yup.string().nullable(),
});

// ─── Initial values ────────────────────────────────────────────────────────

export const editProfileInitialValues = {
  phone: '',
  location: '',
  campusId: '',
  school: '',
};
