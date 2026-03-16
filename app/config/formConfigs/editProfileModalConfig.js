import * as Yup from 'yup';

// ─── Field definitions ─────────────────────────────────────────────────────

/**
 * Edit-profile modal fields.
 * Pass `defaultValues` from current user data to pre-populate the form.
 *
 * @param {{ phone?: string; location?: string }} defaultValues
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
});

// ─── Initial values ────────────────────────────────────────────────────────

export const editProfileInitialValues = {
  phone: '',
  location: '',
};
